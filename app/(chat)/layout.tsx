import { Sidebar } from "@/components/shell/Sidebar"
import { MobileSidebar } from "@/components/shell/MobileSidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"

export default async function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect("/auth/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { folders: true, sessions: { orderBy: { updatedAt: 'desc' } } }
    })

    if (!user) redirect("/auth/login")

    const folders = user?.folders || []
    const chats = user?.sessions || []

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar className="hidden md:flex border-r" folders={folders} chats={chats} user={user} />
            <div className="md:hidden absolute top-3 right-4 z-50">
                <MobileSidebar folders={folders} chats={chats} user={user} />
            </div>
            <main className="flex-1 flex flex-col overflow-hidden w-full">
                {children}
            </main>
        </div>
    )
}
