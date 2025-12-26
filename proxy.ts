import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Next.js Proxy/Middleware for authentication and security
 * Combines route protection with security headers
 */
export default async function proxy(req: NextRequest) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAdmin = token?.role === "ADMIN"

    const { pathname } = req.nextUrl

    // 1. Check authentication and redirect if needed
    // Protect /dashboard (Admin only)
    if (pathname.startsWith("/dashboard")) {
        if (!isAuth) {
            return NextResponse.redirect(new URL("/auth/sign-in", req.url))
        }
        if (!isAdmin) {
            return NextResponse.redirect(new URL("/home", req.url))
        }
    }

    // Protect /home (User only)
    if (pathname.startsWith("/home")) {
        if (!isAuth) {
            return NextResponse.redirect(new URL("/auth/sign-in", req.url))
        }
        // Redirect admins to dashboard
        if (isAdmin) {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }
    }

    // Protect Auth routes (Redirect to correct dashboard/home if already logged in)
    if (pathname.startsWith("/auth")) {
        if (isAuth) {
            if (isAdmin) {
                return NextResponse.redirect(new URL("/dashboard", req.url))
            } else {
                return NextResponse.redirect(new URL("/home", req.url))
            }
        }
    }

    // Protect API admin routes
    if (pathname.startsWith("/api/admin")) {
        if (!token || token.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }
    }

    // 2. Add security headers to response
    const response = NextResponse.next()

    const securityHeaders = {
        // Prevent clickjacking
        "X-Frame-Options": "DENY",
        // Prevent MIME type sniffing
        "X-Content-Type-Options": "nosniff",
        // Enable XSS protection
        "X-XSS-Protection": "1; mode=block",
        // Referrer policy
        "Referrer-Policy": "strict-origin-when-cross-origin",
        // Permissions policy
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        // HSTS - Force HTTPS (only in production)
        ...(process.env.NODE_ENV === "production" && {
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        }),
    }

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
