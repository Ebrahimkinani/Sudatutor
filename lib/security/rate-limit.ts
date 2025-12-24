import "server-only"

type RateLimitResult = { success: boolean; remaining: number }

interface RateLimiter {
    check(key: string, limit: number): Promise<RateLimitResult>
}

// 1. Memory Adapter (Dev)
const memoryStore = new Map<string, { count: number; expiresAt: number }>()

class MemoryRateLimiter implements RateLimiter {
    async check(key: string, limit: number): Promise<RateLimitResult> {
        const now = Date.now()
        const windowMs = 60 * 1000
        const record = memoryStore.get(key)

        if (!record || now > record.expiresAt) {
            memoryStore.set(key, { count: 1, expiresAt: now + windowMs })
            return { success: true, remaining: limit - 1 }
        }

        if (record.count >= limit) {
            return { success: false, remaining: 0 }
        }

        record.count += 1
        return { success: true, remaining: limit - record.count }
    }
}

// 2. Redis Adapter (Prod - Upstash/Redis)
// import { Redis } from "@upstash/redis"
class RedisRateLimiter implements RateLimiter {
    // private redis = new Redis(...) 
    async check(key: string, limit: number): Promise<RateLimitResult> {
        // Implementation would use redis.incr() and expire()
        // For now fallback to memory in implementation
        return new MemoryRateLimiter().check(key, limit)
    }
}

// Factory
export const rateLimiter = process.env.NODE_ENV === "production"
    ? new RedisRateLimiter()
    : new MemoryRateLimiter()

export async function rateLimit(key: string, limit = 10) {
    return rateLimiter.check(key, limit)
}
