import { NextResponse } from "next/server";
import { dashboardService, DashboardFilter } from "../dashboard.service";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filter: DashboardFilter = {
            from: searchParams.get("from") || undefined,
            to: searchParams.get("to") || undefined,
            range: (searchParams.get("range") as any) || undefined,
        };

        // If no specific range provided and no dates, default to 'today' or let service handle it
        if (!filter.from && !filter.to && !filter.range) {
            filter.range = 'today';
        }

        const data = await dashboardService.getDashboardData(filter);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
