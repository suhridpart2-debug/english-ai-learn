import { supabase } from "@/lib/supabaseClient";
import { DAILY_VIDEOS, VideoLearningObject } from "../data/dailyVideos";

export interface VideoSession {
  windowIndex: number;
  videos: VideoLearningObject[];
  nextRefresh: Date;
}

export class VideoService {
  /**
   * Gets the current 6-hour window index (0-3)
   */
  static getCurrentWindowIndex(): number {
    return Math.floor(new Date().getHours() / 6);
  }

  /**
   * Gets the next refresh timestamp
   */
  static getNextRefreshTime(): Date {
    const now = new Date();
    const currentWindow = this.getCurrentWindowIndex();
    const nextWindowHour = (currentWindow + 1) * 6;
    
    const nextRefresh = new Date(now);
    nextRefresh.setHours(nextWindowHour, 0, 0, 0);
    
    // If it's already past 18:00, next refresh is 00:00 tomorrow
    if (nextWindowHour >= 24) {
      nextRefresh.setDate(now.getDate() + 1);
      nextRefresh.setHours(0, 0, 0, 0);
    }
    
    return nextRefresh;
  }

  /**
   * Returns 3 videos for the current 4-hour cycle.
   * Now fetches from Supabase rotated_video_sets.
   */
  static async getDailyVideosAsync(): Promise<VideoLearningObject[]> {
    try {
      // 1. Get current cycle
      const { data: cycle } = await supabase
        .from('content_refresh_cycles')
        .select('cycle_index')
        .order('last_refresh_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!cycle) return DAILY_VIDEOS.slice(0, 3); // Fallback

      // 2. Get rotated ids
      const { data: rotated } = await supabase
        .from('rotated_video_sets')
        .select('video_ids')
        .eq('cycle_index', cycle.cycle_index)
        .single();

      if (!rotated || !rotated.video_ids) return DAILY_VIDEOS.slice(0, 3);

      // 3. Map IDs back to objects from the pool
      const selected = rotated.video_ids
        .map((id: string) => DAILY_VIDEOS.find(v => v.id === id))
        .filter(Boolean) as VideoLearningObject[];

      return selected.length > 0 ? selected : DAILY_VIDEOS.slice(0, 3);
    } catch (err) {
      console.error("VideoService: Error fetching rotated videos", err);
      return DAILY_VIDEOS.slice(0, 3);
    }
  }

  /**
   * Old synchronous method kept for backward compatibility if needed, 
   * but should be moved to getDailyVideosAsync.
   */
  static getDailyVideos(): VideoLearningObject[] {
    return DAILY_VIDEOS.slice(0, 3);
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
    if (!user) return;

    const { error } = await supabase
      .from('user_video_progress')
      .upsert({
        user_id: user.id,
        video_id: videoId,
        saved,
      }, { onConflict: 'user_id,video_id' });

    if (error) console.error("Error toggling video save:", error);
  }

  /**
   * Returns a fallback video from the pool that isn't in the provided exclude list.
   */
  static getFallbackVideo(excludeIds: string[]): VideoLearningObject {
    const pool = DAILY_VIDEOS.filter(v => !excludeIds.includes(v.id));
    // If we've exhausted everything (unlikely), just return the first one
    if (pool.length === 0) return DAILY_VIDEOS[0];
    
    // Pick one at random from the pool
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  /**
   * Fetches user progress for a set of videos
   */
  static async getUserProgress(videoIds: string[]) {
    // Basic validation to avoid UUID syntax errors in Supabase
    const validIds = videoIds.filter(id => 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    );

    if (validIds.length === 0) return {};

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('user_video_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('video_id', validIds);

    if (error) {
        console.error("Error fetching video progress:", error);
        return {};
    }

    const progressMap: Record<string, any> = {};
    data?.forEach(p => {
      progressMap[p.video_id] = p;
    });
    
    return progressMap;
  }
}
