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

    return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        datasources: url ? {
            db: {
                url: url
            }
        } : undefined
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL) {
    console.warn("⚠️ NEXTAUTH_URL is missing in production. Authentication redirects may fail.")
}


export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
