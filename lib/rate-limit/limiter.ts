// Simple in-memory rate limiter for demo purposes. 
// In production with multiple instances/serverless, use Redis (e.g., Upstash).

const trackers: Record<string, { count: number; expiresAt: number }> = {}

export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60 * 1000) {
    const now = Date.now()
    const record = trackers[ip]

    if (!record || now > record.expiresAt) {
        trackers[ip] = { count: 1, expiresAt: now + windowMs }
        return { success: true }
    }

    if (record.count >= limit) {
        return { success: false }
    }

    record.count++
    return { success: true }
}
