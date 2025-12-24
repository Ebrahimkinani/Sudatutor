import { prisma } from "@/lib/db/prisma"

export class AuthRepository {
    async getUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        })
    }

    // NextAuth Prisma Adapter handles standard session creation so we might not need explicit session methods unless we go custom.
    // But strictly for modularity:

    async createUser(data: any) {
        return prisma.user.create({ data })
    }

    async updateLastLogin(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() }
        })
    }
}

export const authRepository = new AuthRepository()
