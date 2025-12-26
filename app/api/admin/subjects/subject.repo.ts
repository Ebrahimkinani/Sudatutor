import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export class SubjectRepository {
    async findAll({
        classId,
        limit,
        cursor,
        orderBy = { createdAt: 'desc' },
        q // search query
    }: {
        classId?: string;
        limit: number;
        cursor?: string;
        orderBy?: Prisma.SubjectOrderByWithRelationInput;
        q?: string;
    }) {
        const take = limit;
        const skip = cursor ? 1 : 0;
        const cursorObj = cursor ? { id: cursor } : undefined;

        const where: Prisma.SubjectWhereInput = {};
        if (classId && classId !== 'all') {
            where.classId = classId;
        }
        if (q) {
            where.name = { contains: q, mode: 'insensitive' };
        }

        return prisma.subject.findMany({
            where,
            take,
            skip,
            cursor: cursorObj,
            orderBy: [orderBy, { id: 'desc' }],
            include: {
                class: {
                    select: { id: true, name: true }
                }
            }
        });
    }

    async countAll(where: Prisma.SubjectWhereInput = {}) {
        return prisma.subject.count({ where });
    }

    async findAllActive() {
        return prisma.subject.findMany({
            where: { isActive: true },
            select: { id: true, name: true, classId: true },
            orderBy: { name: 'asc' }
        });
    }

    async create(data: { name: string; classId: string; isActive?: boolean }) {
        return prisma.subject.create({
            data
        });
    }

    async update(id: string, data: { name?: string; isActive?: boolean }) {
        return prisma.subject.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return prisma.subject.delete({
            where: { id }
        });
    }

    async getStats(subjectId: string, from: Date, to: Date) {
        // Chats in range
        const chatsCount = await prisma.chatSession.count({
            where: {
                subjectId,
                createdAt: { gte: from, lte: to }
            }
        });

        // Messages in range (via session.subjectId or join)
        const messagesCount = await prisma.message.count({
            where: {
                session: {
                    subjectId,
                },
                createdAt: { gte: from, lte: to }
            }
        });

        // Active Users
        const activeUsersGroup = await prisma.chatSession.groupBy({
            by: ['userId'],
            where: {
                subjectId,
                lastMessageAt: { gte: from, lte: to }
            }
        });
        const activeUsersCount = activeUsersGroup.length;

        return {
            chatsCount,
            messagesCount,
            activeUsersCount
        };
    }

    // Optimized list with stats
    async listWithStats({
        classId,
        from,
        to,
        q,
        skip = 0,
        take = 20
    }: {
        classId?: string;
        from: Date;
        to: Date;
        q?: string;
        skip?: number;
        take?: number;
    }) {
        const where: Prisma.SubjectWhereInput = {};
        if (classId && classId !== 'all') {
            where.classId = classId;
        }
        if (q) {
            where.name = { contains: q, mode: 'insensitive' };
        }

        const subjects = await prisma.subject.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: {
                class: {
                    select: { id: true, name: true }
                }
            }
        });

        const enriched = await Promise.all(subjects.map(async (s) => {
            const stats = await this.getStats(s.id, from, to);
            return {
                ...s,
                stats
            };
        }));

        return enriched;
    }
}

export const subjectRepo = new SubjectRepository();
