import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/learn', '/profile', '/settings']

// Routes that are only accessible when NOT authenticated
const authRoutes = ['/login', '/register']

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check for refresh_token cookie (indicates a session exists)
    // access_token might be expired, but having refresh_token means we can likely refresh.
    const hasSession = request.cookies.has('refresh_token')

    // Check if accessing protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Check if accessing auth route
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute && !hasSession) {
        // Redirect to login if accessing protected route without session
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('from', pathname) // To redirect back after login
        return NextResponse.redirect(url)
    }

    if (isAuthRoute && hasSession) {
        // Redirect to dashboard if accessing login/register while authenticated
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
