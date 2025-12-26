import { NextResponse } from "next/server";
import { classRepo } from "@/app/api/admin/classes/class.repo";

export async function GET() {
    try {
        const classes = await classRepo.findAllActive();
        return NextResponse.json(classes);
    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json(
            { error: "Failed to fetch classes" },
            { status: 500 }
        );
    }
}
