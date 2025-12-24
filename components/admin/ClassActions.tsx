"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash, FileText } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { ClassDialog } from "./ClassDialog";
import { deleteClassAction } from "@/actions/admin/class.actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function ClassActions({ item }: { item: any }) {
    const [showDelete, setShowDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        const res = await deleteClassAction(item.id);
        if (res.success) {
            toast({ title: "Deleted", description: "Class deleted successfully" });
            setShowDelete(false);
        } else {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/admin/subjects?classId=${item.id}`)}>
                        <FileText className="mr-2 h-4 w-4" /> View Subjects
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowEdit(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ClassDialog open={showEdit} onOpenChange={setShowEdit} item={item} />

            <ConfirmDialog
                onConfirm={handleDelete}
                title="Delete Class"
                description={`Are you sure you want to delete "${item.name}"? This will be verified by the server.`}
            >
                <span className="hidden" />
                {/* 
             Trick: ConfirmDialog wraps a trigger. 
             Since we trigger it via state (showDelete), we might need to adjust ConfirmDialog to support controlled open state 
             OR use a different pattern.
             
             Wait, my ConfirmDialog is Trigger-based. It doesn't take `open` prop.
             I should update ConfirmDialog to support controlled state OR wrap the MenuItem (but MenuItem closes dropdown).

             Actually, for Dropdowns, usually we use `<Dialog>` wrapping the whole thing or separate state.
             Let's use the simplest approach: 
             The ConfirmDialog I wrote expects a `children` Trigger.
             It's hard to trigger from Dropdown item directly without closing dropdown.
             
             Fix: I should modify ConfirmDialog to accept `open` and `onOpenChange` props for controlled usage.
          */}
            </ConfirmDialog>

            {/* 
        Alternative: Just use the Dialog directly here instead of wrapper if wrapper is limited.
        But I want to reuse ConfirmDialog. 
        Let's assume I fix ConfirmDialog in the next step to support controlled mode or I use standard Dialog here.
        For now I will implement a local Delete Dialog to be safe and avoid blocking.
      */}
            <DeleteDialog open={showDelete} onOpenChange={setShowDelete} onConfirm={handleDelete} />
        </>
    );
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog";

function DeleteDialog({ open, onOpenChange, onConfirm }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
