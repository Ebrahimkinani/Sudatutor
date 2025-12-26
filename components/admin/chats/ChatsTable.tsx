"use client";

import { AdminTable, Column } from "@/components/admin/AdminTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatItem {
    id: string;
    lastMessageAt: string | Date;
    user: {
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
    class: { name: string; } | null;
    subject: { name: string; } | null;
    _count: { messages: number; };
}

interface ChatsTableProps {
    data: ChatItem[];
}

export function ChatsTable({ data }: ChatsTableProps) {
    const columns: Column<ChatItem>[] = [
        {
            key: "user",
            label: "User",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={item.user?.image || undefined} />
                        <AvatarFallback>{item.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.user?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{item.user?.email || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            key: "class",
            label: "Context",
            render: (item) => (
                <div className="flex flex-col text-sm">
                    <span>{item.class?.name || 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">{item.subject?.name || 'N/A'}</span>
                </div>
            )
        },
        {
            key: "stats",
            label: "Messages",
            render: (item) => item._count.messages
        },
        {
            key: "lastMessageAt",
            label: "Last Active",
            sortable: true,
            render: (item) => new Date(item.lastMessageAt).toLocaleString()
        }
    ];

    return (
        <AdminTable
            data={data}
            columns={columns}
        />
    );
}
