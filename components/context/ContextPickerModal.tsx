"use client"

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { HomeContextForm } from "@/components/dashboard/HomeContextForm"
import { classRepo } from "@/app/api/admin/classes/class.repo"
import { subjectRepo } from "@/app/api/admin/subjects/subject.repo"
import { useEffect, useState } from "react"

export function ContextPickerModal({
    open,
    trigger,
    folderId,
    classes,
    subjects
}: {
    open?: boolean
    trigger?: React.ReactNode
    folderId?: string
    classes: { id: string; name: string }[]
    subjects: { id: string; name: string; classId: string }[]
}) {
    return (
        <Dialog open={open}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-none shadow-none [&>button]:hidden">
                <DialogTitle className="sr-only">بدء محادثة جديدة</DialogTitle>
                <HomeContextForm
                    folderId={folderId}
                    classes={classes}
                    subjects={subjects}
                />
            </DialogContent>
        </Dialog>
    )
}

