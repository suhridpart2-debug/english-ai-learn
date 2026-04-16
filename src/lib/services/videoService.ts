import { supabase } from "@/lib/supabaseClient";
import { DAILY_VIDEOS, VideoLearningObject } from "../data/dailyVideos";

export interface VideoSession {
  windowIndex: number;
  videos: VideoLearningObject[];
  nextRefresh: Date;
}

export class VideoService {
  /**
   * Gets the next refresh timestamp (logic kept for UI timers)
   */
  static getNextRefreshTime(): Date {
    const now = new Date();
    const nextRefresh = new Date(now);
    nextRefresh.setHours(24, 0, 0, 0); // Next refresh is midnight
    return nextRefresh;
  }

  /**
   * Returns 3 stable featured videos for the current date from Supabase.
   * Falls back to static data if DB is empty or selection hasn't happened.
   */
  static async getDailyVideosAsync(): Promise<VideoLearningObject[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: featured, error } = await supabase
        .from('daily_videos')
        .select('*')
        .eq('is_featured_today', true)
        .eq('featured_date', today)
        .limit(3);

      if (error) throw error;

      if (featured && featured.length > 0) {
        return featured.map((dbV: any) => ({
          id: dbV.id,
          title: dbV.title,
          youtubeId: dbV.youtube_id,
          category: dbV.category,
          difficulty: dbV.difficulty,
          summary: dbV.summary,
          vocabulary: dbV.vocabulary || [],
          keyPhrases: dbV.key_phrases || [],
          transcript: dbV.transcript || [],
          duration: dbV.duration_seconds || 0,
        })) as VideoLearningObject[];
      }

      // Fallback if no featured videos for today
      console.warn("VideoService: No featured videos for today found in DB. Falling back to pool.");
      const { data: pool } = await supabase
        .from('daily_videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (pool && pool.length > 0) {
        return pool.map((dbV: any) => ({
          id: dbV.id,
          title: dbV.title,
          youtubeId: dbV.youtube_id,
          category: dbV.category,
          difficulty: dbV.difficulty,
          summary: dbV.summary,
          vocabulary: dbV.vocabulary || [],
          keyPhrases: dbV.key_phrases || [],
          transcript: dbV.transcript || [],
          duration: dbV.duration_seconds || 0,
        })) as VideoLearningObject[];
      }

      return DAILY_VIDEOS.slice(0, 3);
    } catch (err) {
      console.error("VideoService: Error fetching daily videos", err);
      return DAILY_VIDEOS.slice(0, 3);
    }
  }

  /**
   * Deprecated: Use getDailyVideosAsync
   */
  static getDailyVideos(): VideoLearningObject[] {
    return DAILY_VIDEOS.slice(0, 3);
  }

  /**
   * Returns all available educational videos from the DB
   */
  static async getAllVideosAsync(): Promise<VideoLearningObject[]> {
    try {
      const { data, error } = await supabase
        .from('daily_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((dbV: any) => ({
          id: dbV.id,
          title: dbV.title,
          youtubeId: dbV.youtube_id,
          category: dbV.category,
          difficulty: dbV.difficulty,
          summary: dbV.summary,
          vocabulary: dbV.vocabulary || [],
          keyPhrases: dbV.key_phrases || [],
          transcript: dbV.transcript || [],
          duration: dbV.duration_seconds || 0,
        })) as VideoLearningObject[];
      }

      return DAILY_VIDEOS;
    } catch (err) {
      console.error("VideoService: Error fetching all videos", err);
      return DAILY_VIDEOS;
    }
  }

  /**
   * Tracks video progress in Supabase
   */
  static async updateProgress(videoId: string, watched: boolean, progressSeconds: number = 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_video_progress')
      .upsert({
        user_id: user.id,
        video_id: videoId,
        watched,
        progress_seconds: progressSeconds,
        last_watched_at: new Date().toISOString(),
      }, { onConflict: 'user_id,video_id' });

    if (error) console.error("Error updating video progress:", error);
  }

  /**
   * Toggles "Save for Later"
   */
  static async toggleSave(videoId: string, saved: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('user_video_progress')
      .upsert({
        user_id: user.id,
        video_id: videoId,
        saved,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,video_id' });

    if (error) throw error;
    return { saved };
  }

  /**
   * Fetches user progress for a set of videos
   */
  static async getUserProgress(videoIds: string[]) {
    if (videoIds.length === 0) return {};

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('user_video_progress')
      .select('*')
      .in('video_id', videoIds);

    if (error) return {};

    const progressMap: Record<string, any> = {};
    data?.forEach(p => {
      progressMap[p.video_id] = p;
    });
    
    return progressMap;
  }

  /**
   * Returns a fallback video from the pool that isn't in the provided exclude list.
   */
  static getFallbackVideo(excludeIds: string[]): VideoLearningObject {
    const pool = DAILY_VIDEOS.filter(v => !excludeIds.includes(v.id));
    if (pool.length === 0) return DAILY_VIDEOS[0];
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  /**
   * Fetches all videos saved by the user
   */
  static async getSavedVideosAsync(): Promise<VideoLearningObject[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_video_progress')
      .select('video_id')
      .eq('user_id', user.id)
      .eq('saved', true);

    if (error || !data) return [];

    const savedIds = data.map(d => d.video_id);
    const all = await this.getAllVideosAsync();
    return all.filter(v => savedIds.includes(v.id));
  }
}
