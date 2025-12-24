"use client"

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { HomeContextForm } from "@/components/dashboard/HomeContextForm"
import { useState } from "react"

export function ContextPickerModal({
    open,
    trigger,
    folderId
}: {
    open?: boolean
    trigger?: React.ReactNode
    folderId?: string
}) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState("")

    return (
        <Dialog open={open}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-none shadow-none [&>button]:hidden">
                <DialogTitle className="sr-only">بدء محادثة جديدة</DialogTitle>
                <HomeContextForm folderId={folderId} />
            </DialogContent>
        </Dialog>
    )
}

