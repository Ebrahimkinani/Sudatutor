import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export class ClassRepository {
    async findAll({
        limit,
        cursor,
        orderBy = { createdAt: 'desc' }
    }: {
        limit: number;
        cursor?: string;
        orderBy?: Prisma.ClassOrderByWithRelationInput;
    }) {
        const take = limit;
        const skip = cursor ? 1 : 0;
        const cursorObj = cursor ? { id: cursor } : undefined;

        return prisma.class.findMany({
            take,
            skip,
            cursor: cursorObj,
            orderBy: [orderBy, { id: 'desc' }], // Tie-breaker
            include: {
                _count: {
                    select: { subjects: true, sessions: true }
                }
            }
        });
    }

    async countAll() {
        return prisma.class.count();
    }

    async findAllActive() {
        return prisma.class.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        });
    }

    async create(data: { name: string; grade?: string; isActive?: boolean }) {
        return prisma.class.create({
            data
        });
    }

    async update(id: string, data: { name?: string; grade?: string; isActive?: boolean }) {
        return prisma.class.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return prisma.class.delete({
            where: { id }
        });
    }

    async getStats(classId: string, from: Date, to: Date) {
        // 1. Subjects count is not date dependent usually (unless we track when subject was added, which we do via createdAt)
        // But usually "Subjects count" means currently available subjects. 
        // BUT prompt says: "Subjects count (total subjects under class)", "Chats count (within date range)"

        // Total subjects
        const subjectsCount = await prisma.subject.count({
            where: { classId }
        });

        // Chats in range
        const chatsCount = await prisma.chatSession.count({
            where: {
                classId,
                createdAt: { gte: from, lte: to }
            }
        });

        // Messages in range (needs complex join or separate query if no direct relation to class on message)
        // Message -> Session -> Class.
        // We can query Message where Session.classId = classId
        const messagesCount = await prisma.message.count({
            where: {
                session: {
                    classId,
                },
                createdAt: { gte: from, lte: to }
            }
        });

        // Active Users in range (Distinct userIds in sessions for this class)
        // "Active Users" = distinct userId who chatted in this class
        // We can group by userId on ChatSession or Message. 
        // Ideally use Message to see who *chatted*, but simplier is ChatSession started/updated.
        // "Active Users ... who chatted". A session implies chatting.
        const activeUsersGroup = await prisma.chatSession.groupBy({
            by: ['userId'],
            where: {
                classId,
                lastMessageAt: { gte: from, lte: to }
            }
        });
        const activeUsersCount = activeUsersGroup.length;

        return {
            subjectsCount,
            chatsCount,
            messagesCount,
            activeUsersCount
        };
    }

    async listWithStats({
        from,
        to,
        skip = 0,
        take = 20
    }: {
        from: Date;
        to: Date;
        skip?: number;
        take?: number;
    }) {
        // We need to fetch classes first
        const classes = await prisma.class.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: {
                _count: {
                    select: { subjects: true } // Static count
                }
            }
        });

        // Now enrich with date-ranged stats
        // To avoid N+1, we might want to consolidate queries, but for Admin pagination (20 rows), Promise.all is acceptable.
        // Aggregations in Mongo are tricky via Prisma.
        // Let's use `Promise.all` mapping.

        const enriched = await Promise.all(classes.map(async (c) => {
            const stats = await this.getStats(c.id, from, to);
            return {
                ...c,
                stats
            };
        }));

        return enriched;
    }
}

export const classRepo = new ClassRepository();
