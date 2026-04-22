import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set(
      "redirect",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  // ONBOARDING REDIRECTION LOGIC
  const onboardingCompleted = user.user_metadata?.onboarding_completed;
  const isPathOnboarding = request.nextUrl.pathname === "/onboarding";

  if (!onboardingCompleted && !isPathOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (onboardingCompleted && isPathOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ADMIN PROTECTION
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  
  if (isAdminPath) {
    // SPECIAL FALLBACK: Hardcoded access for the user
    if (user.email === "suhridpart2@gmail.com") {
      console.log("[Middleware] Granting hardcoded admin access to:", user.email);
      return response;
    }

    // Standard check using ADMIN CLIENT to bypass RLS
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      console.log("[Middleware] Not an admin. Redirecting.");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/practice/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/vocabulary/:path*",
    "/grammar/:path*",
    "/admin/:path*",
  ],
};
