import { chatService } from "@/app/api/admin/chats/chat.service";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AnalyticsDateFilter } from "@/components/admin/AnalyticsDateFilter";
import { SubjectFilterSelect } from "@/components/admin/SubjectFilterSelect";
import { ChatsTable } from "@/components/admin/chats/ChatsTable";

export default async function ChatsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const from = typeof params.from === "string" ? params.from : undefined;
    const to = typeof params.to === "string" ? params.to : undefined;
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;
    const q = typeof params.q === "string" ? params.q : undefined;
    const classId = typeof params.classId === "string" ? params.classId : undefined;
    // TODO: Add Subject filter logic in UI if needed, for now just class

    const limit = 20;

    const { chats, classes, total } = await chatService.getChatsList({
        from,
        to,
        page,
        limit,
        q,
        classId
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Chats</h2>
            </div>

            <AnalyticsDateFilter />

            <AdminToolbar placeholder="Search chats by user or ID..." >
                <SubjectFilterSelect classes={classes} defaultValue={classId} />
            </AdminToolbar>

            <ChatsTable data={chats} />

            <AdminPagination
                hasNextPage={total > page * limit}
                hasPrevPage={page > 1}
            />
        </div>
    );
}
