import { NextResponse } from "next/server";
import { analyticsRepository } from "@/modules/analytics/repositories/analytics.repository";
import { AnalyticsQuerySchema } from "@/modules/analytics/validators/analytics.schema";
import { subDays, startOfDay } from "date-fns";
import { DailySubjectStats } from "@/modules/analytics/types";

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

        const stats = await analyticsRepository.getDailySubjectStats(range);

        const aggregated = stats.reduce((acc: Record<string, any>, curr: DailySubjectStats) => {
            if (!acc[curr.subjectId]) {
                acc[curr.subjectId] = {
                    subjectId: curr.subjectId,
                    subjectName: curr.subjectId,
                    activeStudents: 0,
                    totalChats: 0,
                    totalMessages: 0,
                    dailyActivity: []
                };
            }
            acc[curr.subjectId].totalChats += curr.chats;
            acc[curr.subjectId].totalMessages += curr.messages;
            acc[curr.subjectId].activeStudents = Math.max(acc[curr.subjectId].activeStudents, curr.activeStudents);
            acc[curr.subjectId].dailyActivity.push({
                date: curr.date.toISOString(),
                value: curr.chats
            });
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json(Object.values(aggregated));

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
