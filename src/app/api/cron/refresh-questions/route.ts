import { NextResponse } from 'next/server';
import { InterviewService } from '@/lib/services/interviewService';

const POPULAR_ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer"];
const TARGET_COMPANIES = ["TCS", "Amazon", "Generic"];

export async function GET(request: Request) {
  // 1. Enforce CRON_SECRET for production security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("[Refresh Cron] Unauthorized attempt blocked.");
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  console.log("[Refresh Cron] Starting Secure Question Pool Refresh...");
  
  const stats = { rolesProcessed: 0, newQuestionsAdded: 0 };

  try {
    const selectedRoles = POPULAR_ROLES.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    for (const role of selectedRoles) {
      for (const company of TARGET_COMPANIES) {
        try {
          const count = await InterviewService.refreshDynamicPool(role, company);
          stats.newQuestionsAdded += count;
          stats.rolesProcessed++;
        } catch (err) {
          console.error(`[Refresh Cron] Failed for ${role}/${company}:`, err);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Refreshed ${stats.rolesProcessed} pools. Added ${stats.newQuestionsAdded} questions.`,
      stats 
    });
    
  } catch (error: any) {
    console.error("[Refresh Cron] Critical failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
