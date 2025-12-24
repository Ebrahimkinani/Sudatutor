import { analyticsRepository } from "../repositories/analytics.repository";
import { DateRange, AnalyticsOverviewDTO, DailyClassStats, DailySubjectStats, DailyUserStats } from "../types";
import { startOfDay, subDays } from "date-fns";
// import { DailyClassStats, DailySubjectStats, DailyUserStats } from "@prisma/client"; // Use local types fallback

export class AnalyticsService {
    async getOverview(range: DateRange): Promise<AnalyticsOverviewDTO> {
        const dailyUserStats = await analyticsRepository.getDailyUserStats(range);
        const totalUsers = await analyticsRepository.getTotalUsers();

        // Calculate totals for the period
        const stats = dailyUserStats.map((stat: DailyUserStats) => ({
            date: stat.date.toISOString(),
            value: stat.activeUsers
        }));

        // For top classes/subjects, we need to fetch their stats
        // This is a simplified version; in production we might cache this or do heavy aggregation
        const classStats = await analyticsRepository.getDailyClassStats(range);
        const subjectStats = await analyticsRepository.getDailySubjectStats(range);

        const totalChats = classStats.reduce((sum: number, item: DailyClassStats) => sum + item.chats, 0);
        const totalMessages = classStats.reduce((sum: number, item: DailyClassStats) => sum + item.messages, 0);

        const topClassesMap = classStats.reduce((acc: Record<string, number>, curr: DailyClassStats) => {
            acc[curr.classId] = (acc[curr.classId] || 0) + curr.messages;
            return acc;
        }, {} as Record<string, number>);

        const topSubjectsMap = subjectStats.reduce((acc: Record<string, number>, curr: DailySubjectStats) => {
            acc[curr.subjectId] = (acc[curr.subjectId] || 0) + curr.messages;
            return acc;
        }, {} as Record<string, number>);

        const topClasses = Object.entries(topClassesMap)
            .map(([name, activity]): { name: string; activity: number } => ({ name, activity: activity as number })) // name is classId here, ideally we fetch class name
            .sort((a, b) => b.activity - a.activity)
            .slice(0, 5);

        const topSubjects = Object.entries(topSubjectsMap)
            .map(([name, activity]): { name: string; activity: number } => ({ name, activity: activity as number }))
            .sort((a, b) => b.activity - a.activity)
            .slice(0, 5);

        return {
            totalUsers,
            activeUsersTrend: stats,
            totalChats,
            totalMessages,
            topClasses,
            topSubjects
        };
    }

    async getClassesStats(range: DateRange) {
        const stats = await analyticsRepository.getDailyClassStats(range);
        const aggregated = stats.reduce((acc: Record<string, any>, curr: DailyClassStats) => {
            if (!acc[curr.classId]) {
                acc[curr.classId] = {
                    id: curr.classId,
                    name: curr.classId,
                    activeStudents: 0,
                    chats: 0,
                    messages: 0,
                };
            }
            acc[curr.classId].chats += curr.chats;
            acc[curr.classId].messages += curr.messages;
            acc[curr.classId].activeStudents = Math.max(acc[curr.classId].activeStudents, curr.activeStudents);
            return acc;
        }, {});
        return Object.values(aggregated).sort((a: any, b: any) => b.messages - a.messages);
    }

    async getSubjectsStats(range: DateRange) {
        const stats = await analyticsRepository.getDailySubjectStats(range);
        const aggregated = stats.reduce((acc: Record<string, any>, curr: DailySubjectStats) => {
            if (!acc[curr.subjectId]) {
                acc[curr.subjectId] = {
                    id: curr.subjectId,
                    name: curr.subjectId,
                    activeStudents: 0,
                    chats: 0,
                    messages: 0,
                };
            }
            acc[curr.subjectId].chats += curr.chats;
            acc[curr.subjectId].messages += curr.messages;
            acc[curr.subjectId].activeStudents = Math.max(acc[curr.subjectId].activeStudents, curr.activeStudents);
            return acc;
        }, {});
        return Object.values(aggregated).sort((a: any, b: any) => b.messages - a.messages);
    }

    async getChatsTrend(range: DateRange) {
        const stats = await analyticsRepository.getDailyClassStats(range);
        const dailyChats = stats.reduce((acc: Record<string, any>, curr: DailyClassStats) => {
            const dateStr = curr.date.toISOString();
            if (!acc[dateStr]) {
                acc[dateStr] = { date: dateStr, chats: 0, messages: 0 };
            }
            acc[dateStr].chats += curr.chats;
            acc[dateStr].messages += curr.messages;
            return acc;
        }, {});

        return Object.values(dailyChats).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
}

export const analyticsService = new AnalyticsService();
