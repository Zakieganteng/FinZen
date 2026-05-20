import { NextResponse } from 'next/server'

export async function middleware(req) {
  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/reset-password', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // For now, let ProtectedRoute component handle auth checks
  // Middleware will be enhanced later with proper Supabase session check
  // This is a simpler approach that works with client-side auth
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

