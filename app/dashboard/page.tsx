
import { Suspense } from "react";
import { dashboardService } from "@/app/api/admin/analytics/dashboard.service";
import { KPICard } from "@/components/admin/KPICard";
import { OverviewChart, TopMetricChart } from "@/components/admin/AnalyticsCharts";
import { AnalyticsDateFilter } from "@/components/admin/AnalyticsDateFilter";
import { Users, MessageSquare, Activity, UserPlus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;
    const { from, to, range } = params;

    const data = await dashboardService.getDashboardData({
        from,
        to,
        range: range as any
    });

    const { metrics, charts, dateRange } = data;

    // Helper to find metric by type
    const getMetric = (type: string) => metrics.find(m => m.type === type);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden md:inline-block">
                        {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <AnalyticsDateFilter />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Users"
                    value={getMetric("total_users")?.value || 0}
                    icon={Users}
                    description="All time registered users"
                />
                <KPICard
                    title="Active Users"
                    value={getMetric("active_users")?.value || 0}
                    icon={Activity}
                    description="Active in selected period"
                />
                <KPICard
                    title="New Signups"
                    value={getMetric("new_users")?.value || 0}
                    icon={UserPlus}
                    description="Joined in selected period"
                />
                <KPICard
                    title="Total Messages"
                    value={getMetric("total_messages")?.value || 0}
                    icon={MessageSquare}
                    description="Messages in selected period"
                />
            </div>

            {/* Main Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {charts.userGrowth.length > 0 ? (
                            <OverviewChart data={charts.userGrowth.map(d => ({ date: d.date, value: d.users }))} />
                        ) : (
                            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                                No data available for this period
                            </div>
                        )}
                    </CardContent>
                </Card>
                <div className="col-span-3 space-y-4">
                    <TopMetricChart title="Top Classes" data={charts.topClasses} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <TopMetricChart title="Top Subjects" data={charts.topSubjects} />
                </div>
            </div>
        </div>
    );
}
