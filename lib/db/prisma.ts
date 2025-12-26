import { PrismaClient } from "@prisma/client"
import "server-only"

const prismaClientSingleton = () => {
    // Support both MONGODB_URI (standard) and DATABASE_URL (Prisma default)
    const url = process.env.MONGODB_URI || process.env.DATABASE_URL

    // Prevent connection attempts if no URL is provided (prevents crashes in some environments)
    if (!url) {
        if (process.env.NODE_ENV === "production") {
            console.error("❌ MONGODB_URI or DATABASE_URL is missing. Database connection will fail.")
        } else {
            console.warn("⚠️ MONGODB_URI or DATABASE_URL is missing.")
        }
    }

    // Validate connection string doesn't get logged
    if (url && process.env.NODE_ENV === "development") {
        // Only log that connection string exists, never the actual value
        console.log("✅ Database connection string configured")
    }

    return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        datasources: url ? {
            db: {
                url: url
            }
        } : undefined,
        // Add query timeout for security (prevent long-running queries)
        // @ts-ignore - This is a valid option but not in types
        __internal: {
            engine: {
                queryTimeout: 10000, // 10 seconds
            }
        }
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

// Validate environment variables on startup
if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXTAUTH_URL) {
        console.warn("⚠️ NEXTAUTH_URL is missing in production. Authentication redirects may fail.")
    }
    if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
        console.error("❌ AUTH_SECRET or NEXTAUTH_SECRET is missing. Authentication will fail.")
    }
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
