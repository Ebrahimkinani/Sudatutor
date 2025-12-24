import { NextResponse } from "next/server"

export function addSecureHeaders(response: NextResponse) {
    response.headers.set("X-DNS-Prefetch-Control", "on")
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
    response.headers.set("X-Frame-Options", "SAMEORIGIN")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "origin-when-cross-origin")

    // CSP is complex and app-specific, consider adding strictly if needed
    // response.headers.set("Content-Security-Policy", "...")

    return response
}
