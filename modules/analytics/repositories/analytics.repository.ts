import { prisma } from "@/lib/db/prisma";
import { DateRange } from "../types";

export class AnalyticsRepository {
    async getDailyUserStats(range: DateRange) {
        // Aggregate from User table
        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: range.from,
                    lte: range.to,
                }
            },
            select: { createdAt: true }
        });

        const grouped = this.groupByDay(users, 'createdAt');
        return Object.entries(grouped).map(([date, count]) => ({
            id: date,
            date: new Date(date),
            activeUsers: count, // Using new users as proxy for activity count in this view
            totalUsers: 0, // Placeholder, calculated properly in service if needed
            newUsers: count
        })).sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    async getDailyClassStats(range: DateRange, classId?: string) {
        // Aggregate from ChatSession and Messages
        const sessions = await prisma.chatSession.findMany({
            where: {
                createdAt: {
                    gte: range.from,
                    lte: range.to,
                },
                ...(classId ? { classId } : {}),
            },
            include: {
                messages: {
                    select: { id: true }
                }
            }
        });

        const dailyStats: Record<string, any> = {};

        sessions.forEach(session => {
            const dateKey = session.createdAt.toISOString().split('T')[0];
            const cId = session.classId || 'unknown';

            const key = `${dateKey}_${cId}`; // Composite key for grouping if needed, or just aggregate per day

            // For this specific method, we likely want stats PER DAY, potentially grouped by classId?
            // The interface implies a list of stats.

            // Let's simplify: return flat list of "events" basically
            if (!dailyStats[key]) {
                dailyStats[key] = {
                    id: key,
                    date: new Date(dateKey),
                    classId: cId,
                    chats: 0,
                    messages: 0,
                    activeStudents: 0 // distinct students not easily calculated here without looking at userIds
                };
            }

            dailyStats[key].chats += 1;
            dailyStats[key].messages += session.messages.length;
        });

        return Object.values(dailyStats).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
    }

    async getDailySubjectStats(range: DateRange, subjectId?: string) {
        const sessions = await prisma.chatSession.findMany({
            where: {
                createdAt: {
                    gte: range.from,
                    lte: range.to,
                },
                ...(subjectId ? { subjectId } : {}),
            },
            include: {
                messages: {
                    select: { id: true }
                }
            }
        });

        const dailyStats: Record<string, any> = {};

        sessions.forEach(session => {
            const dateKey = session.createdAt.toISOString().split('T')[0];
            const sId = session.subjectId || 'unknown';
            const key = `${dateKey}_${sId}`;

            if (!dailyStats[key]) {
                dailyStats[key] = {
                    id: key,
                    date: new Date(dateKey),
                    subjectId: sId,
                    chats: 0,
                    messages: 0,
                    activeStudents: 0
                };
            }
            dailyStats[key].chats += 1;
            dailyStats[key].messages += session.messages.length;
        });

        return Object.values(dailyStats).sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
    }

    private groupByDay(items: any[], dateField: string) {
        return items.reduce((acc: Record<string, number>, item) => {
            const dateKey = new Date(item[dateField]).toISOString().split('T')[0];
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
        }, {});
    }

    async getTotalUsers() {
        return prisma.user.count();
    }

    async getAggregatedClassStats(range: DateRange) {
        // Group by classId and sum up metrics
        // Since Mongo doesn't support groupBy with sum easily in Prisma yet for all versions, 
        // or we might want to do it in memory if the dataset is small-ish (per day stats),
        // but the requirement is pre-aggregated. 
        // We can fetch all daily stats for the range and aggregate in app.
        const stats = await this.getDailyClassStats(range);

        const aggregated = stats.reduce((acc: Record<string, any>, curr: any) => {
            if (!acc[curr.classId]) {
                acc[curr.classId] = {
                    classId: curr.classId,
                    activeStudents: 0,
                    chats: 0,
                    messages: 0,
                };
            }
            acc[curr.classId].chats += curr.chats;
            acc[curr.classId].messages += curr.messages;
            acc[curr.classId].activeStudents = Math.max(acc[curr.classId].activeStudents, curr.activeStudents);
            return acc;
        }, {} as Record<string, any>);

        return Object.values(aggregated);
    }
}

export const analyticsRepository = new AnalyticsRepository();
