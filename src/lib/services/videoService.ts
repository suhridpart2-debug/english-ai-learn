import { supabase } from "@/lib/supabaseClient";
import { VideoLearningObject } from "../data/dailyVideos";

export interface DBVideo {
  id: string;
  title: string;
  youtube_id: string;
  category: string;
  difficulty: string;
  summary: string;
  vocabulary: any[];
  key_phrases: any[];
  transcript: any[];
  duration_seconds: number;
  thumbnail_url: string;
  channel_name?: string;
  is_from_trusted_source?: boolean;
  is_valid?: boolean;
}

const BLACKLIST_IDS = ["dQw4w9WgXcQ", "LzR7G8_0_9E", "JkXl_P75rZc", "kMjwIgXk3B4"];

export class VideoService {
  /**
   * Helper to map DB row to VideoLearningObject
   */
  private static mapDBToVideo(dbV: DBVideo): VideoLearningObject {
    return {
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
      thumbnailUrl: dbV.thumbnail_url || `https://i.ytimg.com/vi/${dbV.youtube_id}/hqdefault.jpg`,
      channelName: dbV.channel_name,
      isTrusted: dbV.is_from_trusted_source
    } as VideoLearningObject;
  }

  /**
   * Returns the next refresh timestamp for the UI countdown.
   * Based on 4-hour intervals (00:00, 04:00, 08:00, etc.)
   */
  static getNextRefreshTime(): Date {
    const now = new Date();
    const nextRefresh = new Date(now);
    const hours = now.getHours();
    const interval = 4;
    
    const nextHour = Math.ceil((hours + 0.0001) / interval) * interval;
    
    if (nextHour >= 24) {
      nextRefresh.setDate(nextRefresh.getDate() + 1);
      nextRefresh.setHours(0, 0, 0, 0);
    } else {
      nextRefresh.setHours(nextHour, 0, 0, 0);
    }
    
    return nextRefresh;
  }

  /**
   * Safe fetch for multiple records. Returns an array or null to signal fallback.
   */
  private static async safeFetchMany(query: any): Promise<any[] | null> {
    const { data, error } = await query;
    
    if (error) {
      if (error.code === '42703') { // Column missing (is_valid)
        return null; // Signals to caller to try fallback (without is_valid)
      }
      console.error("VideoService safeFetchMany error", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return [];
    }

    if (!Array.isArray(data)) return [];

    return data.filter((v: any) => !BLACKLIST_IDS.includes(v.youtube_id));
  }

  /**
   * Safe fetch for a single record. Returns an object, null, or undefined to signal fallback.
   */
  private static async safeFetchOne(query: any): Promise<any | null | undefined> {
    const { data, error } = await query;

    if (error) {
      if (error.code === '42703') { // Column missing
        return undefined; // Signals to caller to try fallback
      }
      console.error("VideoService safeFetchOne error", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    if (!data) return null;
    
    // Ensure we are working with a single object (if query returned array)
    const video = Array.isArray(data) ? data[0] : data;
    
    if (BLACKLIST_IDS.includes(video?.youtube_id)) {
      console.warn(`VideoService: Blocked access to blacklisted video ${video.youtube_id}`);
      return null;
    }

    return video;
  }

  /**
   * Returns 3 stable featured videos for the current date from Supabase.
   */
  static async getDailyVideosAsync(): Promise<VideoLearningObject[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase.from('daily_videos').select('*')
        .eq('is_featured_today', true)
        .eq('featured_date', today)
        .eq('is_valid', true)
        .limit(3);

      let featured = await this.safeFetchMany(query);
      
      // Fallback if column missing
      if (featured === null) {
        const { data: fallback } = await supabase.from('daily_videos').select('*')
          .eq('is_featured_today', true)
          .eq('featured_date', today)
          .limit(3);
        featured = fallback?.filter((v: any) => !BLACKLIST_IDS.includes(v.youtube_id)) || [];
      }

      if (featured && featured.length > 0) return featured.map(this.mapDBToVideo);

      // Fallback pool
      let poolQuery = supabase.from('daily_videos').select('*')
        .eq('is_valid', true)
        .order('is_from_trusted_source', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      let pool = await this.safeFetchMany(poolQuery);
      if (pool === null) {
        const { data: fallbackPool } = await supabase.from('daily_videos').select('*')
          .order('is_from_trusted_source', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3);
        pool = fallbackPool?.filter((v: any) => !BLACKLIST_IDS.includes(v.youtube_id)) || [];
      }

      return pool?.map(this.mapDBToVideo) || [];
    } catch (err) {
      console.error("VideoService: Critical failure in getDailyVideosAsync", err);
      return [];
    }
  }

  /**
   * Returns all available educational videos from the DB.
   */
  static async getAllVideosAsync(): Promise<VideoLearningObject[]> {
    try {
      let query = supabase.from('daily_videos').select('*')
        .eq('is_valid', true)
        .order('is_from_trusted_source', { ascending: false })
        .order('created_at', { ascending: false });

      let data = await this.safeFetchMany(query);
      if (data === null) {
        const { data: fallback } = await supabase.from('daily_videos').select('*')
          .order('is_from_trusted_source', { ascending: false })
          .order('created_at', { ascending: false });
        data = fallback?.filter((v: any) => !BLACKLIST_IDS.includes(v.youtube_id)) || [];
      }

      return data?.map(this.mapDBToVideo) || [];
    } catch (err) {
      console.error("VideoService: Error in getAllVideosAsync", err);
      return [];
    }
  }

  /**
   * Fetches a single video by ID (UUID)
   */
  static async getVideoByIdAsync(id: string): Promise<VideoLearningObject | null> {
    try {
      // 1. Fetch with is_valid filter
      let query = supabase.from('daily_videos').select('*').eq('id', id).eq('is_valid', true).maybeSingle();
      let dbV = await this.safeFetchOne(query);

      // 2. Fallback if column missing (safeFetchOne returns undefined for missing column code 42703)
      if (dbV === undefined) {
        const { data: fallback } = await supabase.from('daily_videos').select('*').eq('id', id).maybeSingle();
        dbV = (fallback && !BLACKLIST_IDS.includes(fallback.youtube_id)) ? fallback : null;
      }

      if (!dbV) return null;
      return this.mapDBToVideo(dbV);
    } catch (err) {
      console.error("VideoService: Critical error in getVideoByIdAsync", err);
      return null;
    }
  }

  /**
   * Tracks video progress
   */
  static async updateProgress(videoId: string, watched: boolean, progressSeconds: number = 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('user_video_progress').upsert({
        user_id: user.id,
        video_id: videoId,
        watched,
        progress_seconds: progressSeconds,
        last_watched_at: new Date().toISOString(),
      }, { onConflict: 'user_id,video_id' });
  }

  /**
   * Toggles "Save for Later"
   */
  static async toggleSave(videoId: string, saved: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    await supabase.from('user_video_progress').upsert({
        user_id: user.id,
        video_id: videoId,
        saved,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,video_id' });
    return { saved };
  }

  /**
   * Fetches user progress
   */
  static async getUserProgress(videoIds: string[]) {
    if (videoIds.length === 0) return {};
    const { data, error } = await supabase.from('user_video_progress').select('*').in('video_id', videoIds);
    if (error) return {};
    const progressMap: Record<string, any> = {};
    data?.forEach(p => { progressMap[p.video_id] = p; });
    return progressMap;
  }

  static async getFallbackVideoAsync(excludeIds: string[]): Promise<VideoLearningObject | null> {
    const all = await this.getAllVideosAsync();
    const pool = all.filter(v => !excludeIds.includes(v.id));
    return pool.length > 0 ? pool[0] : null; 
  }

  static async getSavedVideosAsync(): Promise<VideoLearningObject[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('user_video_progress').select('video_id').eq('user_id', user.id).eq('saved', true);
    if (error || !data) return [];
    const savedIds = data.map(d => d.video_id);
    const all = await this.getAllVideosAsync();
    return all.filter(v => savedIds.includes(v.id));
  }
}
