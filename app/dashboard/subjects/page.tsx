
import { analyticsService } from "@/modules/analytics/services/analytics.service";
import { AnalyticsDateFilter } from "@/components/admin/AnalyticsDateFilter";
import { AnalyticsTable } from "@/components/admin/AnalyticsTable";
import { subDays, startOfDay } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminSubjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;
    const defaultTo = new Date();
    const defaultFrom = startOfDay(subDays(defaultTo, 30));

    const from = params.from ? new Date(params.from) : defaultFrom;
    const to = params.to ? new Date(params.to) : defaultTo;

    const data = await analyticsService.getSubjectsStats({ from, to });

    const columns = [
        { key: "name", label: "Subject Name" },
        { key: "activeStudents", label: "Active Students" },
        { key: "chats", label: "Total Chats" },
        { key: "messages", label: "Total Messages" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Subjects Analytics</h1>
            <AnalyticsDateFilter />
            <AnalyticsTable data={data} columns={columns} />
        </div>
    );
}
