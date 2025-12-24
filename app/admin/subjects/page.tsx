import { subjectService } from "@/app/api/admin/subjects/subject.service";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AnalyticsDateFilter } from "@/components/admin/AnalyticsDateFilter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SubjectDialog } from "@/components/admin/SubjectDialog";
import { SubjectFilterSelect } from "@/components/admin/SubjectFilterSelect";
import { SubjectsTable } from "@/components/admin/subjects/SubjectsTable";

export default async function SubjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const from = typeof params.from === "string" ? params.from : undefined;
    const to = typeof params.to === "string" ? params.to : undefined;
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;
    const q = typeof params.q === "string" ? params.q : undefined;
    const classId = typeof params.classId === "string" ? params.classId : undefined;

    const limit = 20;

    const { subjects, allClasses, total } = await subjectService.getSubjectsList({
        from,
        to,
        page,
        limit,
        q,
        classId
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
                <div className="flex items-center space-x-2">
                    <SubjectDialog classes={allClasses}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Subject
                        </Button>
                    </SubjectDialog>
                </div>
            </div>

            <AnalyticsDateFilter />

            <AdminToolbar placeholder="Search subjects..." >
                <SubjectFilterSelect classes={allClasses} defaultValue={classId} />
            </AdminToolbar>

            <SubjectsTable data={subjects} allClasses={allClasses} />

            <AdminPagination
                hasNextPage={total > page * limit}
                hasPrevPage={page > 1}
            />
        </div>
    );
}
