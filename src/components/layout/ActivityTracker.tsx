'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ROUTE_MAP: Record<string, string> = {
  '/dashboard': 'Viewed Dashboard',
  '/practice/pronunciation': 'Practicing Pronunciation',
  '/practice/conversation': 'Conversation Practice',
  '/grammar': 'Learning Grammar',
  '/vocabulary': 'Reviewing Vocabulary',
  '/billing': 'Viewing Subscriptions',
  '/profile': 'Managing Profile',
  '/learn': 'Exploring Learning Path',
  '/history': 'Reviewing Progress History',
};

export default function ActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    const trackActivity = async () => {
      // Don't track same path twice in a row (e.g. search param changes)
      // unless you specifically want to track every click
      if (lastLoggedPath.current === pathname) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Skip admin routes unless you want to track yourself
      if (pathname.startsWith('/admin')) return;

      const description = ROUTE_MAP[pathname] || `Visited ${pathname}`;
      
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'page_view',
          description,
          metadata: {
            url: pathname,
            params: Object.fromEntries(searchParams.entries()),
            timestamp: new Date().toISOString(),
          }
        });

      if (error) {
        console.error('Error logging activity:', error);
      } else {
        lastLoggedPath.current = pathname;
      }
    };

    trackActivity();
  }, [pathname, searchParams, supabase]);

  return null; // This is a background component
}
