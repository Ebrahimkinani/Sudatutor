import { NextResponse } from "next/server";
import { analyticsRepository } from "@/modules/analytics/repositories/analytics.repository";
import { AnalyticsQuerySchema } from "@/modules/analytics/validators/analytics.schema";
import { subDays, startOfDay } from "date-fns";
import { DailyClassStats } from "@/modules/analytics/types";

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

        // Return aggregated per class for the list
        const stats = await analyticsRepository.getDailyClassStats(range);

        // In a real app we would aggregate by classId here to return a list of classes with their totals
        // Simple aggregation:
        const aggregated = stats.reduce((acc: Record<string, any>, curr: DailyClassStats) => {
            if (!acc[curr.classId]) {
                acc[curr.classId] = {
                    classId: curr.classId,
                    className: curr.classId, // simplistic mapping
                    activeStudents: 0,
                    totalChats: 0,
                    totalMessages: 0,
                    dailyActivity: []
                };
            }
            acc[curr.classId].totalChats += curr.chats;
            acc[curr.classId].totalMessages += curr.messages;
            acc[curr.classId].activeStudents = Math.max(acc[curr.classId].activeStudents, curr.activeStudents); // take max for period
            acc[curr.classId].dailyActivity.push({
                date: curr.date.toISOString(),
                value: curr.chats // or messages
            });
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json(Object.values(aggregated));

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
