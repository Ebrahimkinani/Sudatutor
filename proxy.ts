import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// export default function proxy(req: NextRequest) {
// Next 16 might want "proxy" named export or default. Error said "default or 'proxy'".
// Let's try named export 'proxy' first as matches the file name concept, or default.
// "Ensure this file has either a default or "proxy" function export."
export default async function proxy(req: NextRequest) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAdmin = token?.role === "ADMIN"

    const { pathname } = req.nextUrl

    // 2. Protect /dashboard (Admin only)
    if (pathname.startsWith("/dashboard")) {
        if (!isAuth) {
            return NextResponse.redirect(new URL("/auth/sign-in", req.url))
        }
        if (!isAdmin) {
            return NextResponse.redirect(new URL("/home", req.url))
        }
    }

    // 3. Protect /home (User only)
    // Note: The user requirement said: "/home must be logged-in-only"
    if (pathname.startsWith("/home")) {
        if (!isAuth) {
            return NextResponse.redirect(new URL("/auth/sign-in", req.url))
        }
        // Optional: If admin goes to /home, do we redirect to dashboard?
        // User request: "Admin users must be redirected to /dashboard... Normal users... to /home"
        // It doesn't explicitly forbid Admin from viewing /home, but usually better to separate.
        // Let's keep it flexible or redirect if strict.
        // For now, allow admin to see home if they explicitly navigate there, or redirect?
        // Let's redirect admins to dashboard to enforce separation as implied by "Admin users must be redirected to /dashboard"
        if (isAdmin) {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }
    }

    // 4. Protect Auth routes (Redirect to correct dashboard/home if already logged in)
    if (pathname.startsWith("/auth")) {
        if (isAuth) {
            if (isAdmin) {
                return NextResponse.redirect(new URL("/dashboard", req.url))
            } else {
                return NextResponse.redirect(new URL("/home", req.url))
            }
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/", "/dashboard/:path*", "/home/:path*", "/auth/:path*"],
}
