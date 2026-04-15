import { createClient } from "@/lib/supabase/client";
import { VOCABULARY_DATA } from "@/lib/data/vocabularyData";
import { DAILY_VIDEOS } from "@/lib/data/dailyVideos";

const REFRESH_INTERVAL_HOURS = 4;

export async function triggerRefreshIfNeeded() {
  const supabase = createClient();
  
  // 1. Get global refresh state
  const { data: cycle, error: cycleError } = await supabase
    .from('content_refresh_cycles')
    .select('*')
    .order('last_refresh_at', { ascending: false })
    .limit(1)
    .single();

  if (cycleError && cycleError.code !== 'PGRST116') {
    console.error("RefreshService: Error fetching cycle", cycleError);
    return;
  }

  const now = new Date();
  let shouldRefresh = false;
  let nextCycleIndex = 0;

  if (!cycle) {
    shouldRefresh = true;
  } else {
    const lastRefresh = new Date(cycle.last_refresh_at);
    const diffHours = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
    
    if (diffHours >= REFRESH_INTERVAL_HOURS) {
      shouldRefresh = true;
      nextCycleIndex = cycle.cycle_index + 1;
    }
  }

  if (shouldRefresh) {
    console.log("RefreshService: Rotating content for cycle", nextCycleIndex);
    
    // A. Select 5 Vocabulary Words
    // Logic: Level-based selection + semi-random for now (later can be personalized)
    // We shuffle the static pool and pick 5
    const shuffledVocab = [...VOCABULARY_DATA].sort(() => 0.5 - Math.random());
    const selectedVocabIds = shuffledVocab.slice(0, 5).map(v => v.id);

    // B. Select 3 Videos
    const shuffledVideos = [...DAILY_VIDEOS].sort(() => 0.5 - Math.random());
    const selectedVideoIds = shuffledVideos.slice(0, 3).map(v => v.id);

    // C. Persist to DB
    const { error: updateError } = await supabase
      .from('content_refresh_cycles')
      .upsert({
        id: cycle?.id || undefined,
        last_refresh_at: now.toISOString(),
        cycle_index: nextCycleIndex,
        status: 'active'
      });

    if (updateError) {
      console.error("RefreshService: Error updating cycle", updateError);
      return;
    }

    // Upsert rotated sets
    await supabase.from('rotated_vocabulary_sets').upsert({
      cycle_index: nextCycleIndex,
      word_ids: selectedVocabIds
    });

    await supabase.from('rotated_video_sets').upsert({
      cycle_index: nextCycleIndex,
      video_ids: selectedVideoIds
    });

    console.log("RefreshService: Content rotation complete.");
  }
}

/**
 * Fetches the current set of rotated content
 */
export async function getCurrentRotatedContent() {
  const supabase = createClient();
  
  const { data: cycle } = await supabase
    .from('content_refresh_cycles')
    .select('cycle_index')
    .order('last_refresh_at', { ascending: false })
    .limit(1)
    .single();

  if (!cycle) return null;

  const [vocabRes, videoRes] = await Promise.all([
    supabase.from('rotated_vocabulary_sets').select('word_ids').eq('cycle_index', cycle.cycle_index).single(),
    supabase.from('rotated_video_sets').select('video_ids').eq('cycle_index', cycle.cycle_index).single()
  ]);

  return {
    vocabularyIds: vocabRes.data?.word_ids || [],
    videoIds: videoRes.data?.video_ids || []
  };
}
