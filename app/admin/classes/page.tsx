import { classService } from "@/app/api/admin/classes/class.service";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AnalyticsDateFilter } from "@/components/admin/AnalyticsDateFilter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClassDialog } from "@/components/admin/ClassDialog";
import { ClassesTable } from "@/components/admin/classes/ClassesTable";

export default async function ClassesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const from = typeof params.from === "string" ? params.from : undefined;
    const to = typeof params.to === "string" ? params.to : undefined;
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;
    const limit = 20;

    const { classes, total } = await classService.getClassesList({
        from,
        to,
        page,
        limit,
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Classes</h2>
                <div className="flex items-center space-x-2">
                    <ClassDialog>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Class
                        </Button>
                    </ClassDialog>
                </div>
            </div>

            <AnalyticsDateFilter />

            <AdminToolbar placeholder="Search classes..." />

            <ClassesTable data={classes} />

            <AdminPagination
                hasNextPage={total > page * limit}
                hasPrevPage={page > 1}
            />
        </div>
    );
}
