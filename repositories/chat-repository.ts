import { prisma } from "@/lib/db/prisma"
import { Prisma } from "@prisma/client"

export class ChatRepository {
    async createSession(data: Prisma.ChatSessionCreateInput) {
        return prisma.chatSession.create({
            data,
        })
    }

    async findSessionById(id: string) {
        return prisma.chatSession.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }, // Initial load usually needs oldest first or newest first depending on UI
                }
            }
        })
    }

    /**
     * List sessions with stable cursor pagination
     */
    /**
     * List sessions with stable cursor pagination
     */
    async listSessions(userId: string, limit: number, cursor?: string) {
        let cursorData: { lastMessageAt: Date; id: string } | null = null

        if (cursor) {
            cursorData = await prisma.chatSession.findUnique({
                where: { id: cursor },
                select: { lastMessageAt: true, id: true }
            })
        }

        return prisma.chatSession.findMany({
            where: {
                userId,
                ...(cursorData ? {
                    OR: [
                        { lastMessageAt: { lt: cursorData.lastMessageAt } },
                        { lastMessageAt: cursorData.lastMessageAt, id: { lt: cursorData.id } }
                    ]
                } : {})
            },
            take: limit,
            orderBy: [
                { lastMessageAt: "desc" },
                { id: "desc" }
            ],
            include: {
                folder: { select: { name: true } }
            }
        })
    }

    /**
     * List messages for a session with stable cursor pagination
     */
    /**
     * List messages for a session with stable cursor pagination
     */
    async listMessages(sessionId: string, limit: number, cursor?: string) {
        let cursorData: { createdAt: Date; id: string } | null = null

        if (cursor) {
            cursorData = await prisma.message.findUnique({
                where: { id: cursor },
                select: { createdAt: true, id: true }
            })
        }

        return prisma.message.findMany({
            where: {
                sessionId,
                ...(cursorData ? {
                    OR: [
                        { createdAt: { gt: cursorData.createdAt } },
                        { createdAt: cursorData.createdAt, id: { gt: cursorData.id } }
                    ]
                } : {})
            },
            take: limit,
            orderBy: [
                { createdAt: "asc" },
                { id: "asc" }
            ]
        })
    }

    async isOwner(sessionId: string, userId: string): Promise<boolean> {
        const count = await prisma.chatSession.count({
            where: { id: sessionId, userId }
        })
        return count > 0
    }

    async addExchange(
        sessionId: string,
        userContent: string,
        assistantContent: string
    ) {
        // Transactional write for data integrity of message sequence + session update
        return prisma.$transaction(async (tx) => {
            const userMsg = await tx.message.create({
                data: {
                    sessionId,
                    role: "user",
                    content: userContent
                }
            })

            const aiMsg = await tx.message.create({
                data: {
                    sessionId,
                    role: "assistant",
                    content: assistantContent
                }
            })

            await tx.chatSession.update({
                where: { id: sessionId },
                data: {
                    lastMessageAt: new Date(),
                    messageCount: { increment: 2 }
                }
            })

            return { userMsg, aiMsg }
        })
    }

    async deleteSession(sessionId: string) {
        return prisma.chatSession.delete({
            where: { id: sessionId }
        })
    }
}

export const chatRepository = new ChatRepository()
