import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AIService } from '@/lib/services/aiService';

// Constants & Types
const SEARCH_QUERIES = [
  "english conversation practice",
  "beginner spoken english",
  "english speaking practice",
  "daily english conversation",
  "english pronunciation practice",
  "vocabulary for daily use",
  "english interview practice",
  "short english dialogues"
];

const EXCLUDED_KEYWORDS = [
  "song", "music", "official video", "trailer", "movie", "film", "comedy", 
  "entertainment", "shorts", "kids", "rhyme", "cartoon"
];

const FEATURED_COUNT = 3;

/**
 * Normalizes AI output to ensure required fields and safe defaults
 */
function normalizeMetadata(raw: any) {
  return {
    summary: raw?.summary || "A daily educational video about English.",
    category: raw?.category || "Conversation",
    difficulty: raw?.difficulty || "Intermediate",
    vocabulary: Array.isArray(raw?.vocabulary) ? raw.vocabulary.slice(0, 3) : [],
    keyPhrases: Array.isArray(raw?.keyPhrases) ? raw.keyPhrases.slice(0, 3) : []
  };
}

/**
 * Parses YouTube ISO 8601 duration (e.g. PT5M30S) into seconds
 */
function parseISO8601Duration(duration: string): number | null {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // 1. Auth Validation
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("[CRON] Authentication rejected.");
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  console.log("[CRON] Ingestion started.");

  const stats = {
    queriesUsed: [] as string[],
    totalFetched: 0,
    filteredOut: 0,
    duplicates: 0,
    inserted: 0,
    failed: 0,
    details: [] as any[]
  };

  try {
    const youtubeKey = process.env.YOUTUBE_API_KEY;
    let candidates: { id: string, title: string, description: string, duration?: string }[] = [];

    // 2. Multi-query Search
    if (youtubeKey) {
      stats.queriesUsed = [...SEARCH_QUERIES].sort(() => 0.5 - Math.random()).slice(0, 3);
      console.log(`[CRON] Using queries: ${stats.queriesUsed.join(", ")}`);

      for (const query of stats.queriesUsed) {
        try {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&key=${youtubeKey}`
          );
          
          if (res.ok) {
            const data = await res.json();
            const items = data.items || [];
            stats.totalFetched += items.length;

            for (const item of items) {
              const title = item.snippet.title.toLowerCase();
              const description = item.snippet.description.toLowerCase();
              
              // Relevance Filtering
              const isExcluded = EXCLUDED_KEYWORDS.some(kw => title.includes(kw) || description.includes(kw));
              if (isExcluded) {
                stats.filteredOut++;
                continue;
              }

              if (!candidates.find(v => v.id === item.id.videoId)) {
                candidates.push({
                  id: item.id.videoId,
                  title: item.snippet.title,
                  description: item.snippet.description
                });
              }
            }
          }
        } catch (err) {
          console.error(`[CRON] Fetch error for query "${query}":`, err);
        }
      }

      // Fetch precise durations for candidates
      if (candidates.length > 0) {
        const ids = candidates.map(c => c.id).join(',');
        const vRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${youtubeKey}`);
        if (vRes.ok) {
          const vData = await vRes.json();
          vData.items?.forEach((item: any) => {
            const index = candidates.findIndex(c => c.id === item.id);
            if (index !== -1) candidates[index].duration = item.contentDetails.duration;
          });
        }
      }
    } else {
      console.log("[CRON] No YouTube API key. Using local mock candidates for verification.");
      candidates = [
        { id: "JkXl_P75rZc", title: "Common English Mistakes", description: "Learn to avoid common pitfalls in spoken English.", duration: "PT5M30S" },
        { id: "kMjwIgXk3B4", title: "Daily Conversation Starters", description: "How to start a conversation naturally.", duration: "PT8M15S" },
        { id: "dQw4w9WgXcQ", title: "English Pronunciation Masterclass", description: "Deep dive into phonetics.", duration: "PT12M45S" }
      ];
      stats.totalFetched = candidates.length;
    }

    // 3. Ingestion Loop
    for (const video of candidates) {
      try {
        // Deduplication
        const { data: existing } = await supabaseAdmin
          .from('daily_videos')
          .select('id')
          .eq('youtube_id', video.id)
          .maybeSingle();
          
        if (existing) {
          stats.duplicates++;
          continue;
        }

        // AI Metadata
        const aiResult = await AIService.extractVideoLearningData(video.title, video.description);
        const metadata = normalizeMetadata(aiResult.data);
        const durationSeconds = video.duration ? parseISO8601Duration(video.duration) : null;

        // DB Insert
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('daily_videos')
          .insert({
             title: video.title,
             youtube_id: video.id,
             category: metadata.category,
             difficulty: metadata.difficulty,
             summary: metadata.summary,
             vocabulary: metadata.vocabulary,
             key_phrases: metadata.keyPhrases,
             thumbnail_url: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
             duration_seconds: durationSeconds,
             transcript: []
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        stats.inserted++;
        stats.details.push({ id: video.id, status: 'inserted', provider: aiResult.provider });
      } catch (err: any) {
        stats.failed++;
        console.error(`[CRON] Failed to process video ${video.id}:`, err.message);
        stats.details.push({ id: video.id, status: 'failed', error: err.message });
      }
    }

    // 4. Daily Featured Selection (Stable for the day)
    const today = new Date().toISOString().split('T')[0];
    const { data: existingFeatured } = await supabaseAdmin
      .from('daily_videos')
      .select('id')
      .eq('featured_date', today);

    let featuredMsg = "Daily selection already stable.";
    if (!existingFeatured || existingFeatured.length < FEATURED_COUNT) {
      console.log("[CRON] Refreshing daily featured selection...");
      
      // Reset old featured
      await supabaseAdmin.from('daily_videos')
        .update({ is_featured_today: false })
        .eq('is_featured_today', true);

      // Pick 3 from the latest valid pool
      const { data: pool } = await supabaseAdmin
        .from('daily_videos')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(20);

      if (pool && pool.length >= FEATURED_COUNT) {
        const selected = pool.sort(() => 0.5 - Math.random()).slice(0, FEATURED_COUNT);
        const selectedIds = selected.map(s => s.id);
        
        await supabaseAdmin.from('daily_videos')
          .update({ is_featured_today: true, featured_date: today })
          .in('id', selectedIds);
          
        featuredMsg = `Selected ${selectedIds.length} new featured videos for ${today}.`;
      } else {
        featuredMsg = "Not enough videos in pool for daily selection.";
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`[CRON] Completed in ${duration}s. Summary: ${stats.inserted} inserted, ${stats.duplicates} duplicates.`);

    return NextResponse.json({ 
      success: true, 
      stats,
      featured: featuredMsg,
      executionTimeSeconds: duration
    });
    
  } catch (error: any) {
    console.error("[CRON] Critical failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
