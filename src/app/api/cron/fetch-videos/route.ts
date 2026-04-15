import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { AIService } from '@/lib/services/aiService';

// Standard fallback/mock library if YouTube API is missing.
const MOCK_YOUTUBE_VIDEOS = [
  { id: "JkXl_P75rZc", title: "Real English Conversation: Small Talk at Work", description: "Learn how to make professional small talk with your coworkers. Vocabulary and phrases included!" },
  { id: "kMjwIgXk3B4", title: "Improve Your English Pronunciation in 10 Minutes", description: "Master the tricky TH sound, ED endings, and Word Stress in just a few minutes." },
  { id: "e1a1b2c3-d4e5", title: "Top 5 English Grammar Mistakes Native Speakers Notice", description: "Stop making these common grammar mistakes. We cover prepositions, tenses, and articles." }
];

export async function GET(request: Request) {
  // Security Protection
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized CRON request' }, { status: 401 });
  }

  try {
    const youtubeKey = process.env.YOUTUBE_API_KEY;
    let fetchedVideos: { id: string, title: string, description: string }[] = [];

    if (youtubeKey) {
      console.log("Ingestion: Triggering YouTube API");
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=english+conversation+practice&type=video&key=${youtubeKey}`);
      if (res.ok) {
         const data = await res.json();
         fetchedVideos = data.items.map((item: any) => ({
           id: item.id.videoId,
           title: item.snippet.title,
           description: item.snippet.description
         }));
      }
    } 
    
    if (fetchedVideos.length === 0) {
      console.log("Ingestion: Triggering Fallback Video Mock Array");
      fetchedVideos = [...MOCK_YOUTUBE_VIDEOS].sort(() => 0.5 - Math.random()).slice(0, 2);
    }

    const insertedIds = [];

    for (const video of fetchedVideos) {
      const { data: existing } = await supabase
        .from('daily_videos')
        .select('id')
        .eq('youtube_id', video.id)
        .single();
        
      if (existing) {
        console.log(`Video ${video.id} already exists`);
        continue;
      }

      console.log(`Ingestion: Generating AI metadata for ${video.id}`);
      const aiResult = await AIService.extractVideoLearningData(video.title, video.description);
      const aiData = aiResult.data;

      if (aiResult.provider === "LocalFallback") {
        console.warn(`[Pipeline Fallback] AI Providers failed for ${video.id}. Triggering deterministic metadata fallback.`);
        console.warn("AI Trace Errors:", JSON.stringify(aiResult.errors, null, 2));
      } else {
        console.log(`[Pipeline Success] Metadata generated successfully using ${aiResult.provider} for ${video.id}`);
      }

      const { data: inserted, error } = await supabase
        .from('daily_videos')
        .insert({
           title: video.title,
           youtube_id: video.id,
           category: aiData.category,
           difficulty: aiData.difficulty,
           summary: aiData.summary,
           vocabulary: aiData.vocabulary,
           key_phrases: aiData.keyPhrases,
           thumbnail_url: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
           duration_seconds: Math.floor(Math.random() * 600) + 120 
        })
        .select('id')
        .single();
        
      if (error) {
         console.error("Ingestion: DB Insert Error:", error);
      } else if (inserted) {
         insertedIds.push(inserted.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Ingested ${insertedIds.length} videos!`, 
      ids: insertedIds,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("CRON Ingestion Failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
