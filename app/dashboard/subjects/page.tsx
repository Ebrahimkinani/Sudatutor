import { subjectService } from "@/app/api/admin/subjects/subject.service";
import { SubjectsTable } from "@/components/admin/subjects/SubjectsTable";
import { SubjectDialog } from "@/components/admin/SubjectDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminSubjectsPage() {
    const { subjects, allClasses } = await subjectService.getSubjectsList({});

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Subjects Management</h1>
                <SubjectDialog classes={allClasses}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subject
                    </Button>
                </SubjectDialog>
            </div>
            <SubjectsTable data={subjects} allClasses={allClasses} />
        </div>
    );
}
