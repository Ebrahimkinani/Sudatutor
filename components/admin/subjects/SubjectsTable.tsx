"use client";

import { AdminTable, Column } from "@/components/admin/AdminTable";
import { SubjectActions } from "@/components/admin/SubjectActions";

interface SubjectItem {
    id: string;
    name: string;
    createdAt: Date;
    isActive: boolean;
    class: {
        id: string;
        name: string;
    };
    stats: {
        chatsCount: number;
        messagesCount: number;
        activeUsersCount: number;
    };
}

interface SubjectsTableProps {
    data: SubjectItem[];
    allClasses: { id: string; name: string; }[];
}

export function SubjectsTable({ data, allClasses }: SubjectsTableProps) {
    const columns: Column<SubjectItem>[] = [
        { key: "name", label: "Subject Name", sortable: true, className: "font-medium" },
        { key: "className", label: "Class", render: (item) => item.class.name },
        { key: "chatsCount", label: "Chats", render: (getRow) => getRow.stats.chatsCount },
        { key: "messagesCount", label: "Messages", render: (getRow) => getRow.stats.messagesCount },
        { key: "activeUsersCount", label: "Active Users", render: (getRow) => getRow.stats.activeUsersCount },
        { key: "createdAt", label: "Created At", sortable: true },
        {
            key: "isActive",
            label: "Status",
            render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            className: "w-[100px]",
            render: (item) => <SubjectActions item={item} classes={allClasses} />
        }
    ];

    return (
        <AdminTable
            data={data}
            columns={columns}
        />
    );
}
