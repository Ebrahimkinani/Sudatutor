import { Sidebar } from "@/components/shell/Sidebar"
import { MobileSidebar } from "@/components/shell/MobileSidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { classRepo } from "@/app/api/admin/classes/class.repo"
import { subjectRepo } from "@/app/api/admin/subjects/subject.repo"

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/auth/login")
    }

    // Fetch User, Folders, Chats
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { folders: true, sessions: { orderBy: { updatedAt: 'desc' } } }
    })

    if (!user) {
        redirect("/auth/login")
    }

    const folders = user?.folders || []
    const chats = user?.sessions || []

    // Fetch active classes and subjects
    const classes = await classRepo.findAllActive()
    const subjects = await subjectRepo.findAllActive()

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar
                className="hidden md:flex border-r"
                folders={folders}
                chats={chats}
                user={user}
                classes={classes}
                subjects={subjects}
            />
            <div className="md:hidden absolute top-4 right-4 z-50">
                <MobileSidebar
                    folders={folders}
                    chats={chats}
                    user={user}
                    classes={classes}
                    subjects={subjects}
                />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">

                <main className="flex-1 overflow-y-auto scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}
