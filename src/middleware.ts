import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/learn/:path*',
    '/practice/:path*',
    '/profile/:path*',
    '/history/:path*',
    '/vocabulary/:path*',
    '/grammar/:path*',
    '/onboarding/:path*',
  ],
}
