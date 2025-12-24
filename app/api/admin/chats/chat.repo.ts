import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export class ChatRepository {
    async findAll({
        classId,
        subjectId,
        limit,
        cursor,
        q,
        from,
        to,
        skip,
    }: {
        classId?: string;
        subjectId?: string;
        limit: number;
        cursor?: string;
        q?: string;
        from?: Date;
        to?: Date;
        skip?: number;
    }) {
        const take = limit;
        // explicit skip overrides cursor logic if provided
        const finalSkip = skip !== undefined ? skip : (cursor ? 1 : 0);
        const cursorObj = cursor ? { id: cursor } : undefined;

        const where: Prisma.ChatSessionWhereInput = {};
        if (classId && classId !== 'all') where.classId = classId;
        if (subjectId && subjectId !== 'all') where.subjectId = subjectId;

        // Date range filter: default lastMessageAt
        if (from || to) {
            where.lastMessageAt = {
                gte: from,
                lte: to
            };
        }

        // Search query
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { id: { contains: q, mode: 'insensitive' } }, // Search by ID
                {
                    user: {
                        OR: [
                            { email: { contains: q, mode: 'insensitive' } },
                            { name: { contains: q, mode: 'insensitive' } }
                        ]
                    }
                }
            ];
        }

        return prisma.chatSession.findMany({
            where,
            take,
            skip: finalSkip,
            cursor: cursorObj,
            orderBy: [
                { lastMessageAt: 'desc' },
                { id: 'desc' }
            ],
            include: {
                user: {
                    select: { email: true, name: true, image: true }
                },
                class: {
                    select: { name: true }
                },
                subject: {
                    select: { name: true }
                },
                _count: {
                    select: { messages: true }
                }
            }
        });
    }

    async countAll(where: Prisma.ChatSessionWhereInput = {}) {
        return prisma.chatSession.count({ where });
    }

    async findById(sessionId: string) {
        return prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                user: {
                    select: { email: true, name: true, image: true }
                },
                class: {
                    select: { name: true }
                },
                subject: {
                    select: { name: true }
                }
            }
        });
    }

    async findMessages({
        sessionId,
        limit = 50,
        cursor
    }: {
        sessionId: string;
        limit?: number;
        cursor?: string;
    }) {
        const take = limit;
        const skip = cursor ? 1 : 0;
        const cursorObj = cursor ? { id: cursor } : undefined;

        return prisma.message.findMany({
            where: { sessionId },
            take,
            skip,
            cursor: cursorObj,
            orderBy: { createdAt: 'asc' }, // Oldest first for chat view
        });
    }
}

export const chatRepo = new ChatRepository();
