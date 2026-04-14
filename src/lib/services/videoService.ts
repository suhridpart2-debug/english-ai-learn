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
   * Returns 3 videos for the current 6-hour window.
   * Uses a deterministic selection based on date and window index.
   */
  static getDailyVideos(): VideoLearningObject[] {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const windowIdx = this.getCurrentWindowIndex();
    
    // Simple deterministic seed: "2024-05-20-1" -> hash -> index
    const seed = `${dateStr}-${windowIdx}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    
    const startIdx = Math.abs(hash) % DAILY_VIDEOS.length;
    
    // Pick 3 videos (looping if necessary)
    const selected: VideoLearningObject[] = [];
    for (let i = 0; i < 3; i++) {
        selected.push(DAILY_VIDEOS[(startIdx + i) % DAILY_VIDEOS.length]);
    }
    
    return selected;
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
   * Fetches user progress for a set of videos
   */
  static async getUserProgress(videoIds: string[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('user_video_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('video_id', videoIds);

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
