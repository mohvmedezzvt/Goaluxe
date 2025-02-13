import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add debug logging
function log(message: string, ...args: any[]) {
  console.log(`[Middleware] ${message}`, ...args);
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Define routes
  const isAuthRoute = ['/login', '/register'].includes(pathname)
  const isPublicRoute = ['/', '/about'].includes(pathname)
  const isProtectedRoute = pathname.startsWith('/dashboard')

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  log('Route check:', { pathname, isAuthRoute, isProtectedRoute, hasToken: !!token })

  // Handle authentication redirects
  if (!token && isProtectedRoute) {
    log('Redirecting to login - no token')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthRoute) {
    log('Redirecting to dashboard - already authenticated')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 