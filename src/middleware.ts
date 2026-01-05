import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/']
const PUBLIC_PREFIXES = ['/api/', '/_next/', '/favicon.ico', '/catalog']

/**
 * Security middleware for Next.js
 * - Blocks CVE-2025-29927 header bypass attacks
 * - Validates authentication via httpOnly cookies
 * - Redirects unauthenticated users to login
 */
export function middleware(request: NextRequest) {
    // CVE-2025-29927 FIX: Block x-middleware-subrequest header abuse
    const subrequestHeader = request.headers.get('x-middleware-subrequest')
    if (subrequestHeader) {
        console.warn('[Security] Blocked x-middleware-subrequest bypass attempt:', {
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            path: request.nextUrl.pathname,
        })
        return new NextResponse('Forbidden', { status: 403 })
    }

    const { pathname } = request.nextUrl

    // Skip auth check for public routes
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
    const isPublicPrefix = PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))

    if (isPublicRoute || isPublicPrefix) {
        return NextResponse.next()
    }

    // Check for auth token in httpOnly cookies
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
