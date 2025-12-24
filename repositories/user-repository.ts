import { prisma } from "@/lib/db/prisma"
import { User } from "@prisma/client"

export class UserRepository {
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        })
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        })
    }

    async createUser(data: { email: string; passwordHash: string; name?: string }) {
        return prisma.user.create({
            data,
        })
    }

    async getContext(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, selectedClass: true, selectedSubject: true }
        })
    }
}

export const userRepository = new UserRepository()
