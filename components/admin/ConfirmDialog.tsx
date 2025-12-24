"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    children: React.ReactNode;
    onConfirm: () => void;
    title?: string;
    description?: string;
    actionLabel?: string;
    disabled?: boolean;
}

export function ConfirmDialog({
    children,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    actionLabel = "Continue",
    disabled,
}: ConfirmDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild disabled={disabled}>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={onConfirm}
                        variant="destructive"
                    >
                        {actionLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
