import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { HistoryList } from "@/components/history/HistoryList"
import { redirect } from "next/navigation"

export const metadata = {
    title: "History - SudaTutor",
}

export default async function HistoryPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/auth/login")
    }

    const chats = await prisma.chatSession.findMany({
        where: {
            user: { email: session.user.email }
        },
        orderBy: { lastMessageAt: 'desc' },
        include: {
            class: {
                select: { name: true }
            },
            subject: {
                select: { name: true }
            }
        }
    })

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Your History</h1>
                <p className="text-muted-foreground">Resume your learning sessions.</p>
            </div>

            <HistoryList chats={chats} />
        </div>
    )
}
