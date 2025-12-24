"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createClassAction, updateClassAction } from "@/actions/admin/class.actions";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

interface ClassDialogProps {
    children?: React.ReactNode;
    item?: { id: string, name: string, grade?: string | null, isActive: boolean };
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ClassDialog({ children, item, open, onOpenChange }: ClassDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined;
    const show = isControlled ? open : internalOpen;
    const setShow = isControlled ? onOpenChange! : setInternalOpen;

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        let result;

        if (item) {
            result = await updateClassAction(item.id, formData);
        } else {
            result = await createClassAction(formData);
        }

        setIsLoading(false);

        if (result.error) {
            toast({
                title: "Error",
                description: "Failed to save class",
                variant: "destructive"
            });
        } else {
            toast({
                title: "Success",
                description: `Class ${item ? 'updated' : 'created'} successfully`
            });
            setShow(false);
        }
    }

    return (
        <Dialog open={show} onOpenChange={setShow}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit Class' : 'New Class'}</DialogTitle>
                    <DialogDescription>
                        {item ? 'Make changes to the class here.' : 'Add a new class to the system.'}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" name="name" defaultValue={item?.name} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="grade" className="text-right">
                                Grade
                            </Label>
                            <Input id="grade" name="grade" defaultValue={item?.grade || ''} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="isActive" className="text-right">
                                Active
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch id="isActive" name="isActive" defaultChecked={item ? item.isActive : true} />
                                <Label htmlFor="isActive" className="font-normal text-muted-foreground">{item?.isActive ? 'Enabled' : 'Disabled'}</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
