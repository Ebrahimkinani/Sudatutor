import { NextResponse } from "next/server";
import { analyticsRepository } from "@/modules/analytics/repositories/analytics.repository";
import { AnalyticsQuerySchema } from "@/modules/analytics/validators/analytics.schema";
import { subDays, startOfDay } from "date-fns";
import { DailyClassStats, DailySubjectStats } from "@/modules/analytics/types";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = AnalyticsQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));

        if (!query.success) return NextResponse.json({ error: "Invalid params" }, { status: 400 });

        const defaultTo = new Date();
        const defaultFrom = startOfDay(subDays(defaultTo, 30));

        const range = {
            from: query.data.from ? new Date(query.data.from) : defaultFrom,
            to: query.data.to ? new Date(query.data.to) : defaultTo
        };

        // We can use class stats or subject stats to aggregate total chats per day
        // Or if we had a dedicated DailySystemStats table.
        // Since we have DailyClassStats, we can sum them up by date.

        const stats = await analyticsRepository.getDailyClassStats(range);

        // Group by date
        const dailyChats = stats.reduce((acc: Record<string, { date: string, count: number }>, curr: DailyClassStats) => {
            const dateStr = curr.date.toISOString();
            if (!acc[dateStr]) {
                acc[dateStr] = { date: dateStr, count: 0 };
            }
            acc[dateStr].count += curr.chats;
            return acc;
        }, {} as Record<string, { date: string, count: number }>) as Record<string, { date: string, count: number }>;

        const result = Object.values(dailyChats).sort((a: { date: string, count: number }, b: { date: string, count: number }) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return NextResponse.json(result);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
