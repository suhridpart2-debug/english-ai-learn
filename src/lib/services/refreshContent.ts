import { createClient } from "@/lib/supabase/client";
import { VOCABULARY_DATA, VocabularyWord } from "@/lib/data/vocabularyData";
import { DAILY_VIDEOS, VideoLearningObject } from "@/lib/data/dailyVideos";

const REFRESH_INTERVAL_HOURS = 4;

export async function triggerRefreshIfNeeded() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return;
  const userId = session.user.id;

  // 1. Get personalized refresh state
  let { data: state, error: stateError } = await supabase
    .from('user_rotation_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  const now = new Date();
  let shouldRefresh = false;

  if (!state) {
    shouldRefresh = true;
  } else {
    const lastRefresh = new Date(state.last_vocab_rotation_at);
    const diffHours = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
    
    if (diffHours >= REFRESH_INTERVAL_HOURS) {
      shouldRefresh = true;
    }
  }

  if (shouldRefresh) {
    console.log("RefreshService: Personalizing content for user", userId);
    
    // A. Select 5 Vocabulary Words
    // Filter out words marked as 'learned'
    const { data: learnedWords } = await supabase
      .from('user_word_progress')
      .select('word_id')
      .eq('user_id', userId)
      .eq('status', 'learned');
    
    const learnedIds = new Set(learnedWords?.map(w => w.word_id) || []);
    let availableVocab = VOCABULARY_DATA.filter(v => !learnedIds.has(v.id));
    
    // Strict Rotation: Deprioritize words from the immediate previous cycle
    const previousVocabIds = new Set(state?.current_vocab_ids || []);
    let freshVocab = availableVocab.filter(v => !previousVocabIds.has(v.id));
    
    // Fallback if dataset is too small
    if (freshVocab.length < 5) freshVocab = availableVocab;
    if (freshVocab.length < 5) freshVocab = VOCABULARY_DATA;
    
    const shuffledVocab = [...freshVocab].sort(() => 0.5 - Math.random());
    const selectedVocabIds = shuffledVocab.slice(0, 5).map(v => v.id);

    // B. Select 3 Videos
    const { data: dbVideosData } = await supabase.from('daily_videos').select('*');
    
    let videoPool = DAILY_VIDEOS;
    if (dbVideosData && dbVideosData.length > 0) {
      videoPool = dbVideosData.map((dbV: any) => ({
        id: dbV.id,
        title: dbV.title,
        youtubeId: dbV.youtube_id,
        category: dbV.category,
        difficulty: dbV.difficulty,
        summary: dbV.summary,
        vocabulary: dbV.vocabulary || [],
        keyPhrases: dbV.key_phrases || [],
        transcript: dbV.transcript || [],
        duration: dbV.duration_seconds || 300,
      })) as VideoLearningObject[];
    }

    // Filter out videos marked as 'watched'
    const { data: watchedVideos } = await supabase
      .from('user_video_progress')
      .select('video_id')
      .eq('user_id', userId)
      .eq('watched', true);
    
    const watchedIds = new Set(watchedVideos?.map(v => v.video_id) || []);
    let availableVideos = videoPool.filter(v => !watchedIds.has(v.id));
    
    // Strict Rotation: Deprioritize videos from the immediate previous cycle
    const previousVideoIds = new Set(state?.current_video_ids || []);
    let freshVideos = availableVideos.filter(v => !previousVideoIds.has(v.id));
    
    // Fallback if dataset is too small
    if (freshVideos.length < 3) freshVideos = availableVideos;
    if (freshVideos.length < 3) freshVideos = videoPool;
    
    const shuffledVideos = [...freshVideos].sort(() => 0.5 - Math.random());
    const selectedVideoIds = shuffledVideos.slice(0, 3).map(v => v.id);

    // C. Persist to User State
    const { error: upsertError } = await supabase
      .from('user_rotation_state')
      .upsert({
        user_id: userId,
        last_vocab_rotation_at: now.toISOString(),
        last_video_rotation_at: now.toISOString(),
        current_vocab_ids: selectedVocabIds,
        current_video_ids: selectedVideoIds
      });

    if (upsertError) {
      console.error("RefreshService: Error updating user state", upsertError);
    }
  }
}

/**
 * Fetches the current set of rotated content for the specific user
 */
export async function getCurrentRotatedContent() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: state } = await supabase
    .from('user_rotation_state')
    .select('current_vocab_ids, current_video_ids')
    .eq('user_id', session.user.id)
    .single();

  if (!state) return null;

  return {
    vocabularyIds: state.current_vocab_ids || [],
    videoIds: state.current_video_ids || []
  };
}
