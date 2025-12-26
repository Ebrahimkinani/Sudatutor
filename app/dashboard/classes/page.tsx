import { classService } from "@/app/api/admin/classes/class.service";
import { ClassesTable } from "@/components/admin/classes/ClassesTable";
import { ClassDialog } from "@/components/admin/ClassDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminClassesPage() {
    const { classes } = await classService.getClassesList({});

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Classes Management</h1>
                <ClassDialog>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Class
                    </Button>
                </ClassDialog>
            </div>
            <ClassesTable data={classes} />
        </div>
    );
}
