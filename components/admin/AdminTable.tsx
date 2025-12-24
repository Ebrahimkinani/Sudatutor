"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface AdminTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    rowKey?: (item: T) => string;
}

export function AdminTable<T extends { id: string, createdAt?: Date | string }>({
    data,
    columns,
    loading,
    rowKey
}: AdminTableProps<T>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const handleSort = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (sort === key) {
            params.set("order", order === "asc" ? "desc" : "asc");
        } else {
            params.set("sort", key);
            params.set("order", "asc");
        }
        router.push(`?${params.toString()}`);
    };

    const getSortIcon = (key: string) => {
        if (sort !== key) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
        return order === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
        );
    };

    if (loading) {
        return (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
                Loading data...
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
                No results found.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead
                                key={String(col.key)}
                                className={col.className}
                                onClick={() => col.sortable && handleSort(String(col.key))}
                                style={{ cursor: col.sortable ? "pointer" : "default" }}
                            >
                                <div className="flex items-center">
                                    {col.label}
                                    {col.sortable && getSortIcon(String(col.key))}
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={rowKey ? rowKey(item) : item.id}>
                            {columns.map((col) => (
                                <TableCell key={String(col.key)} className={col.className}>
                                    {col.render
                                        ? col.render(item)
                                        : (item as any)[col.key] instanceof Date
                                            ? format((item as any)[col.key], "MMM d, yyyy")
                                            : (item as any)[col.key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
