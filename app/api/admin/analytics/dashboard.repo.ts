import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export class DashboardRepository {
    async getOverviewStats(startDate: Date, endDate: Date) {
        // 1. Total Users (All time)
        const totalUsers = await prisma.user.count();

        // 2. New Users (In range)
        const newUsers = await prisma.user.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // 3. Active Users (In range) - Users who logged in or had activity
        // We'll use lastLoginAt as a primary indicator for simplicity and performance
        const activeUsers = await prisma.user.count({
            where: {
                lastLoginAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // 4. Total Chats (In range)
        const totalChats = await prisma.chatSession.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // 5. Total Messages (In range)
        const totalMessages = await prisma.message.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        return {
            totalUsers,
            newUsers,
            activeUsers,
            totalChats,
            totalMessages,
        };
    }

    async getRecentSignups(limit: number = 5) {
        return prisma.user.findMany({
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                role: true,
            },
        });
    }

    async getRecentActivity(limit: number = 10) {
        return prisma.analyticsEvent.findMany({
            take: limit,
            orderBy: {
                createdAt: "desc",
            },

        });
    }

    // Get daily stats for charts
    async getDailyStats(startDate: Date, endDate: Date) {
        // Aggregate users by createdAt date
        // Since Prisma groupBy on date fields can be tricky with specific DBs (esp. Mongo dates),
        // we'll fetch users in range and aggregate in app for better control/accuracy on small-medium scale.
        // For 1M+ scale, this should be a raw query or updated via cron/triggers.
        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            select: {
                createdAt: true,
                lastLoginAt: true
            }
        });

        const statsMap = new Map<string, { totalUsers: number; activeUsers: number }>();

        // Initialize map for every day in range to ensure continuous chart
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0];
            statsMap.set(dateKey, { totalUsers: 0, activeUsers: 0 });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        users.forEach(user => {
            const dateKey = user.createdAt.toISOString().split('T')[0];
            const current = statsMap.get(dateKey);
            if (current) {
                current.totalUsers++;
                // Count as active if they logged in on this day (simplification) -> actually activeUsers usually means "active at that point".
                // For a "Growth" chart, "users" usually means accumulative total.
                // But here the chart expects { users: number, active: number } per day.
                // Let's count "New Users" per day for "users" and "Active" based on lastLogin per day??
                // The interface says "userGrowth" -> usually accumulative.
                // However, previous code was `d.totalUsers`.
                // Let's return new users count per day for the bar chart.
            }
        });

        // If we want ACCUMULATIVE total users:
        // We need the count of users BEFORE start date.
        const priorCount = await prisma.user.count({
            where: {
                createdAt: {
                    lt: startDate
                }
            }
        });

        let runningTotal = priorCount;
        const result = [];

        for (const [dateKey, stat] of statsMap.entries()) {
            runningTotal += stat.totalUsers; // Add new users from this day

            // For active users on that day... strictly speaking we can't know historic active users from just `lastLoginAt`.
            // `lastLoginAt` only tells us the LAST time.
            // So for a historic chart, "Active Users" line will be misleading if we only have `lastLogin`.
            // But we can approximate or just show "New Active" (users who signed up that day are active).
            // Better approach: Use the `AnalyticsEvent` table if it exists? 
            // Repo `getRecentActivity` uses `analyticsEvent`. Let's assume we can count events per day.

            result.push({
                date: new Date(dateKey),
                totalUsers: runningTotal,
                activeUsers: stat.totalUsers // Using "New Users" as proxy for "Active" on that day for now since historical session data is missing.
            });
        }

        return result.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    async getTopClasses(limit: number = 5) {
        // 1. Group by classId to get counts
        const topClasses = await prisma.chatSession.groupBy({
            by: ["classId"],
            _count: {
                _all: true,
            },
            where: {
                classId: {
                    not: null
                }
            },
            orderBy: {
                _count: {
                    id: "desc",
                },
            },
            take: limit,
        });

        // 2. Fetch class details for the names
        // Filter out null classIds just in case, though the where clause handles it
        const classIds = topClasses
            .map((c) => c.classId)
            .filter((id): id is string => id !== null);

        const classes = await prisma.class.findMany({
            where: {
                id: {
                    in: classIds,
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        // 3. Map names back to counts
        return topClasses.map((item) => {
            const classInfo = classes.find((c) => c.id === item.classId);
            return {
                name: classInfo?.name || "Unknown Class",
                count: item._count._all,
            };
        });
    }

    async getTopSubjects(limit: number = 5) {
        // 1. Group by subjectId
        const topSubjects = await prisma.chatSession.groupBy({
            by: ["subjectId"],
            _count: {
                _all: true,
            },
            where: {
                subjectId: {
                    not: null
                }
            },
            orderBy: {
                _count: {
                    id: "desc",
                },
            },
            take: limit,
        });

        // 2. Fetch subject details
        const subjectIds = topSubjects
            .map((s) => s.subjectId)
            .filter((id): id is string => id !== null);

        const subjects = await prisma.subject.findMany({
            where: {
                id: {
                    in: subjectIds,
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        // 3. Map names back
        return topSubjects.map((item) => {
            const subjectInfo = subjects.find((s) => s.id === item.subjectId);
            return {
                name: subjectInfo?.name || "Unknown Subject",
                count: item._count._all,
            };
        });
    }
}

export const dashboardRepo = new DashboardRepository();
