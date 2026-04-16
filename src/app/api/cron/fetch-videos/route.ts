import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AIService } from '@/lib/services/aiService';

// Constants & Types
const SEARCH_QUERIES = [
  "bbc learning english", // Guarantee at least one high-quality educational query
  "english conversation practice",
  "beginner spoken english",
  "english speaking practice",
  "daily english conversation",
  "english pronunciation practice",
  "vocabulary for daily use",
  "english interview practice",
  "short english dialogues",
  "learn english through stories",
  "daily english listening"
];

// Curated pool of trusted English-learning channels
const TRUSTED_CHANNELS = [
  "BBC Learning English", "Speak English With Vanessa", "EnglishAddict with Mr Steve", 
  "Learn English with Emma", "English with Lucy", "engVid", "Oxford Online English", 
  "British Council LearnEnglish", "Easy English", "EnglishClass101", "English Speaking Success", 
  "RealLife English", "Learn English with TV Series", "Accent's Way English with Hadar", 
  "Interactive English", "English Fluency Journey", "Speak Confident English", 
  "Go Natural English", "English with Adriana", "To Fluency", "Awal English", "Dear Sir", 
  "TSMadaan", "English Connection", "Learnex English Lessons", "Let's Talk", "ChetChat", 
  "English with Rani Ma'am", "Spoken English Guru", "Study IQ English", "VOA Learning English", 
  "Rachel's English", "ELLLO", "Daily English Conversation", "English Listening Practice", 
  "Speak English with Mr Duncan", "Culips", "Luke's English Podcast", "Storyberries English", 
  "English Stories", "Grammar Girl", "Adam’s English Lessons", "IELTS Liz", 
  "Academic English Help", "CrashCourse", "English Vocabulary Builder", "Business English Pod", 
  "Oxford English Now", "EnglishTestBlog", "IELTS Advantage", "Learn English with Friends", 
  "TED-Ed", "Learn English with Movies", "Cinema English", "FluentU English", 
  "English Through Stories", "Animated English Lessons", "Simple English Videos", 
  "English in Context", "Daily Dose of English", "Espresso English", "ABA English", 
  "English Harmony", "LinguaMarina", "Papa Teach Me", "English Anyone", "Anglo-Link", 
  "mmmEnglish", "ETJ English", "English with Greg", "English Coach Chad", "Accurate English", 
  "English with Kim", "American English at State", "English Language Club", "Learn English Lab", 
  "English Fluency TV", "Smart English Learning", "English with TV", "English Practice Hub", 
  "Learn English Daily", "English Speaking Course", "Everyday English", "English Cafe", 
  "Speak English Daily", "English Mentor", "English Partner", "Fluent English Now", 
  "Speak Better English", "English Express", "English Booster", "English World", 
  "English Mastery", "Talk English", "English Power", "English Builder", "English Smartly", 
  "English Planet", "English Skills Hub", "English Daily Practice"
];

const EXCLUDED_KEYWORDS = [
  "song", "music", "official video", "trailer", "movie", "film", "comedy", 
  "entertainment", "shorts", "kids", "rhyme", "cartoon", "workout", "vlog"
];

const BLACKLIST_VIDEO_IDS = [
  "dQw4w9WgXcQ", // Rick Astley
  "LzR7G8_0_9E", // Reported bad fallback ID
  "JkXl_P75rZc", // Broken thumb reporter ID
  "kMjwIgXk3B4"  // Broken thumb reporter ID
];

const FEATURED_COUNT = 3;

/**
 * Normalizes AI output
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

function parseISO8601Duration(duration: string): number | null {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  return parseInt(match[1] || '0') * 3600 + parseInt(match[2] || '0') * 60 + parseInt(match[3] || '0');
}

/**
 * Stricter thumbnail check
 */
async function isValidThumbnail(url: string, videoId: string): Promise<boolean> {
  if (!url || !url.startsWith("http")) return false;
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (!res.ok) return false;
    
    // YouTube's "grey placeholder" is often returned as a 200 OK for hqdefault if highres fails.
    // However, if we identify it's too small or a dead link, we skip.
    // For now, we trust the HEAD status 200 as a baseline.
    return true;
  } catch (err) {
    // If network fails, only allow if it's a standard YT domain
    return url.includes("ytimg.com") || url.includes("youtube.com");
  }
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const stats = {
    queriesUsed: [] as string[],
    totalFetched: 0,
    filteredOut: 0,
    duplicates: 0,
    inserted: 0,
    failed: 0,
    rejectedByValidation: 0,
    trustedSourceCount: 0
  };

  try {
    const youtubeKey = process.env.YOUTUBE_API_KEY;
    if (!youtubeKey) throw new Error("Missing YouTube API key");

    let candidates: { id: string, title: string, description: string, duration?: string, thumb?: string, channelTitle?: string, isTrusted?: boolean }[] = [];

    // 1. Search Logic
    const activeQueries = ["BBC Learning English", ...[...SEARCH_QUERIES].sort(() => 0.5 - Math.random()).slice(0, 3)];
    stats.queriesUsed = activeQueries;

    for (const query of activeQueries) {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&key=${youtubeKey}`
        );
        
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          stats.totalFetched += items.length;

          for (const item of items) {
            const videoId = item.id?.videoId;
            if (!videoId || BLACKLIST_VIDEO_IDS.includes(videoId)) {
              stats.rejectedByValidation++;
              continue;
            }

            const title = item.snippet.title.toLowerCase();
            const channelTitle = item.snippet.channelTitle;
            const description = item.snippet.description.toLowerCase();
            
            const isExcluded = EXCLUDED_KEYWORDS.some(kw => title.includes(kw) || description.includes(kw));
            if (isExcluded) {
              stats.filteredOut++;
              continue;
            }

            const isTrusted = TRUSTED_CHANNELS.some(tc => 
              channelTitle.toLowerCase() === tc.toLowerCase() || 
              channelTitle.toLowerCase().includes(tc.toLowerCase())
            );
            if (isTrusted) stats.trustedSourceCount++;

            if (!candidates.find(v => v.id === videoId)) {
              candidates.push({
                id: videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumb: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                channelTitle: channelTitle,
                isTrusted: isTrusted
              });
            }
          }
        }
      } catch (err) {
        console.error(`[CRON] Fetch error for query "${query}":`, err);
      }
    }

    // Prioritize Trusted Sources
    candidates.sort((a, b) => Number(b.isTrusted || false) - Number(a.isTrusted || false));

    // 2. Ingestion Logic
    const ingestPool = candidates.slice(0, 10);
    for (const video of ingestPool) {
      try {
        if (!video.thumb) video.thumb = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
        const thumbValid = await isValidThumbnail(video.thumb, video.id);
        if (!thumbValid) {
          stats.rejectedByValidation++;
          continue;
        }

        const { data: existing } = await supabaseAdmin.from('daily_videos').select('id').eq('youtube_id', video.id).maybeSingle();
        if (existing) {
          stats.duplicates++;
          // Update existing to ensure it's marked as valid
          try { await supabaseAdmin.from('daily_videos').update({ is_valid: true } as any).eq('id', (existing as any).id); } catch {}
          continue;
        }

        const aiResult = await AIService.extractVideoLearningData(video.title, video.description);
        const metadata = normalizeMetadata(aiResult.data);
        const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.id}&key=${youtubeKey}`);
        let duration = null;
        if (videoRes.ok) {
          const vData = await videoRes.json();
          if (vData.items?.[0]) duration = parseISO8601Duration(vData.items[0].contentDetails.duration);
        }

        const { error: insertError } = await supabaseAdmin.from('daily_videos').insert({
          title: video.title,
          youtube_id: video.id,
          category: metadata.category,
          difficulty: metadata.difficulty,
          summary: metadata.summary,
          vocabulary: metadata.vocabulary,
          key_phrases: metadata.keyPhrases,
          thumbnail_url: video.thumb,
          duration_seconds: duration,
          channel_name: video.channelTitle || "Educational Channel",
          is_from_trusted_source: video.isTrusted || false,
          is_valid: true,
          transcript: []
        });

        if (insertError) throw insertError;
        stats.inserted++;
      } catch (err: any) {
        stats.failed++;
        console.error(`[CRON] Failed to process video ${video.id}:`, err.message);
      }
    }

    // 3. HARD CLEANUP: Mark blacklist and broken entries invalid
    console.log("[CRON] Performing hard cleanup of invalid content...");
    try {
      // Mark blacklist IDs invalid
      await supabaseAdmin.from('daily_videos').update({ is_valid: false } as any).in('youtube_id', BLACKLIST_VIDEO_IDS);
      // Mark null fields invalid
      await supabaseAdmin.from('daily_videos').update({ is_valid: false } as any).or('youtube_id.is.null,title.is.null,thumbnail_url.is.null');
    } catch (e) { console.warn("[CRON] Maintenance failed (possibly missing is_valid column)."); }

    // 4. Featured Re-Selection
    const today = new Date().toISOString().split('T')[0];
    console.log("[CRON] Refreshing daily featured selection...");
    
    // Reset ALL old featured to ensure fresh start
    await supabaseAdmin.from('daily_videos').update({ is_featured_today: false }).eq('is_featured_today', true);

    // Pick 3 new VALID videos, prioritizing trusted sources
    let useValidFilter = true;
    try { const { error } = await supabaseAdmin.from('daily_videos').select('is_valid').limit(1); if (error) useValidFilter = false; } catch { useValidFilter = false; }

    const poolQuery = supabaseAdmin.from('daily_videos').select('id, is_from_trusted_source, youtube_id');
    if (useValidFilter) poolQuery.eq('is_valid', true);
    // Exclude blacklisted IDs again just in case
    poolQuery.not('youtube_id', 'in', `(${BLACKLIST_VIDEO_IDS.join(',')})`);

    const { data: pool } = await poolQuery
      .order('is_from_trusted_source', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    let featuredMsg = "Refresh failed: not enough pool.";
    if (pool && pool.length >= FEATURED_COUNT) {
      const selected = pool.sort((a, b) => {
          if (a.is_from_trusted_source !== b.is_from_trusted_source) {
              return Number(b.is_from_trusted_source) - Number(a.is_from_trusted_source);
          }
          return 0.5 - Math.random();
      }).slice(0, FEATURED_COUNT);
      
      const updatePayload: any = { is_featured_today: true, featured_date: today };
      if (useValidFilter) updatePayload.is_valid = true;

      await supabaseAdmin.from('daily_videos').update(updatePayload).in('id', selected.map(s => s.id));
      featuredMsg = `Selected ${selected.length} new valid featured videos.`;
    }

    return NextResponse.json({ success: true, stats, featured: featuredMsg });
    
  } catch (error: any) {
    console.error("[CRON] Critical failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
