"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function SubjectFilterSelect({
    classes,
    defaultValue
}: {
    classes: { id: string; name: string }[];
    defaultValue?: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleClassChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val && val !== "all") {
            params.set("classId", val);
            params.set("page", "1");
        } else {
            params.delete("classId");
        }
        router.push(`?${params.toString()}`);
    }

    return (
        <Select value={defaultValue || "all"} onValueChange={handleClassChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
