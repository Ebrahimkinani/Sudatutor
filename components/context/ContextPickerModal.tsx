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
    folderId
}: {
    open?: boolean
    trigger?: React.ReactNode
    folderId?: string
}) {
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
    const [subjects, setSubjects] = useState<{ id: string; name: string; classId: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [classesData, subjectsData] = await Promise.all([
                    fetch('/api/admin/classes').then(res => res.json()),
                    fetch('/api/admin/subjects').then(res => res.json())
                ])
                setClasses(classesData.classes || [])
                setSubjects(subjectsData.subjects || [])
            } catch (error) {
                console.error('Failed to fetch classes/subjects:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <Dialog open={open}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-none shadow-none [&>button]:hidden">
                <DialogTitle className="sr-only">بدء محادثة جديدة</DialogTitle>
                {loading ? (
                    <div className="text-center p-8">جارٍ التحميل...</div>
                ) : (
                    <HomeContextForm
                        folderId={folderId}
                        classes={classes}
                        subjects={subjects}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

