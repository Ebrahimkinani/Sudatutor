
import { analyticsService } from "@/modules/analytics/services/analytics.service";
import { AnalyticsDateFilter } from "@/components/admin/AnalyticsDateFilter";
import { OverviewChart } from "@/components/admin/AnalyticsCharts"; // Reuse chart
import { subDays, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function AdminChatsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;
    const defaultTo = new Date();
    const defaultFrom = startOfDay(subDays(defaultTo, 30));

    const from = params.from ? new Date(params.from) : defaultFrom;
    const to = params.to ? new Date(params.to) : defaultTo;

    const trend = await analyticsService.getChatsTrend({ from, to });

    // Format trend for chart (it expects { date, value })
    const chatsData = trend.map((t: any) => ({ date: t.date, value: t.chats }));
    const messagesData = trend.map((t: any) => ({ date: t.date, value: t.messages }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Chats Analytics</h1>
            <AnalyticsDateFilter />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Chats Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={chatsData} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Messages Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={messagesData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
