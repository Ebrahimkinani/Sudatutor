// Simple in-memory rate limiter for demo purposes. 
// In production with multiple instances/serverless, use Redis (e.g., Upstash).

const trackers: Record<string, { count: number; expiresAt: number }> = {}

export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60 * 1000) {
    const now = Date.now()
    const record = trackers[ip]

    if (!record || now > record.expiresAt) {
        trackers[ip] = { count: 1, expiresAt: now + windowMs }
        return {
            success: true,
            remaining: limit - 1,
            reset: now + windowMs
        }
    }

    if (record.count >= limit) {
        return {
            success: false,
            remaining: 0,
            reset: record.expiresAt
        }
    }

    record.count++
    return {
        success: true,
        remaining: limit - record.count,
        reset: record.expiresAt
    }
}
