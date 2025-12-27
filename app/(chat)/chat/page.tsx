import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { ContextPickerModal } from "@/components/context/ContextPickerModal"
import { Button } from "@/components/ui/button"
import { classRepo } from "@/app/api/admin/classes/class.repo"
import { subjectRepo } from "@/app/api/admin/subjects/subject.repo"

export default async function ChatPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return redirect("/auth/login")

    // Find latest session
    const latest = await prisma.chatSession.findFirst({
        where: { userId: session.user.id },
        orderBy: { lastMessageAt: 'desc' },
        include: { user: true }
    })

    if (latest) {
        redirect(`/chat/${latest.id}`)
    }

    // Fetch active classes and subjects
    const classes = await classRepo.findAllActive()
    const subjects = await subjectRepo.findAllActive()

    // Empty State
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
            <div className="text-center space-y-6 max-w-md px-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-[#7551a2]">SudaTutor</h1>
                    <p className="text-gray-500 text-lg">
                        Your personal AI tutor. Choose a subject to start learning.
                    </p>
                </div>

                <ContextPickerModal
                    classes={classes}
                    subjects={subjects}
                    trigger={
                        <Button size="lg" className="bg-[#7551a2] hover:bg-[#64448c] text-white px-8 text-lg font-semibold h-12 rounded-full shadow-lg hover:shadow-xl transition-all">
                            Let&apos;s Study
                        </Button>
                    }
                />
            </div>
        </div>
    )
}
