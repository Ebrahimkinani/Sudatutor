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
import { createSubjectAction, updateSubjectAction } from "@/actions/admin/subject.actions";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SubjectDialogProps {
    children?: React.ReactNode;
    item?: { id: string, name: string, classId: string, isActive: boolean };
    classes: { id: string, name: string }[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function SubjectDialog({ children, item, classes, open, onOpenChange }: SubjectDialogProps) {
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
            result = await updateSubjectAction(item.id, formData);
        } else {
            result = await createSubjectAction(formData);
        }

        setIsLoading(false);

        if (result.error) {
            toast({
                title: "Error",
                description: "Failed to save subject",
                variant: "destructive"
            });
        } else {
            toast({
                title: "Success",
                description: `Subject ${item ? 'updated' : 'created'} successfully`
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
                    <DialogTitle>{item ? 'Edit Subject' : 'New Subject'}</DialogTitle>
                    <DialogDescription>
                        {item ? 'Make changes to the subject here.' : 'Add a new subject linked to a class.'}
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
                            <Label htmlFor="classId" className="text-right">
                                Class
                            </Label>
                            <div className="col-span-3">
                                {item ? (
                                    // Usually we don't allow changing class relation easily, maybe disable?
                                    // Or just show it as select.
                                    <Select name="classId" defaultValue={item.classId} disabled={!!item}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Select name="classId" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
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
