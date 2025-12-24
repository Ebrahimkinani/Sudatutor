import { dashboardRepo } from "./dashboard.repo";
import { startOfDay, endOfDay, subDays } from "date-fns";

export interface DashboardFilter {
    from?: string;
    to?: string;
    range?: "today" | "7d" | "30d" | "custom";
}

export class DashboardService {
    async getDashboardData(filter: DashboardFilter) {
        const { startDate, endDate } = this.parseDateRange(filter);

        const [overview, recentSignups, recentActivity, dailyStats, topClasses, topSubjects] = await Promise.all([
            dashboardRepo.getOverviewStats(startDate, endDate),
            dashboardRepo.getRecentSignups(5),
            dashboardRepo.getRecentActivity(10),
            dashboardRepo.getDailyStats(startDate, endDate),
            dashboardRepo.getTopClasses(5),
            dashboardRepo.getTopSubjects(5)
        ]);

        return {
            dateRange: {
                from: startDate.toISOString(),
                to: endDate.toISOString(),
            },
            metrics: [
                {
                    label: "Total Users",
                    value: overview.totalUsers,
                    change: null, // We could calculate change if we fetched previous period
                    type: "total_users"
                },
                {
                    label: "Active Users (Period)",
                    value: overview.activeUsers,
                    type: "active_users"
                },
                {
                    label: "New Signups",
                    value: overview.newUsers,
                    type: "new_users"
                },
                {
                    label: "Total Chats",
                    value: overview.totalChats,
                    type: "total_chats"
                },
                {
                    label: "Total Messages",
                    value: overview.totalMessages,
                    type: "total_messages"
                }
            ],
            charts: {
                userGrowth: dailyStats.map(d => ({
                    date: d.date.toISOString(),
                    users: d.totalUsers,
                    active: d.activeUsers
                })),
                topClasses: topClasses.map(c => ({ name: c.name || "Unknown", activity: c.count })),
                topSubjects: topSubjects.map(s => ({ name: s.name || "Unknown", activity: s.count }))
            },
            recentSignups,
            recentActivity
        };
    }

    private parseDateRange(filter: DashboardFilter) {
        const now = new Date();
        let startDate = startOfDay(now);
        let endDate = endOfDay(now);

        if (filter.range === "7d") {
            startDate = startOfDay(subDays(now, 7));
        } else if (filter.range === "30d") {
            startDate = startOfDay(subDays(now, 30));
        } else if (filter.from && filter.to) {
            startDate = startOfDay(new Date(filter.from));
            endDate = endOfDay(new Date(filter.to));
        }

        return { startDate, endDate };
    }
}

export const dashboardService = new DashboardService();
