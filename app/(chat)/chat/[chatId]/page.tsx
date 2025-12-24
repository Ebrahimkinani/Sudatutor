import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { ChatShell } from "@/components/chat/ChatShell"
import { MessageList } from "@/components/chat/MessageList"
import { ChatComposer } from "@/components/chat/ChatComposer"
import { notFound, redirect } from "next/navigation"
import { Message, Prisma } from "@prisma/client"

interface ChatPageProps {
    params: Promise<{
        chatId: string
    }>
}

type ChatWithRelations = Prisma.ChatSessionGetPayload<{
    include: {
        messages: true
        user: {
            select: { email: true; name: true; image: true }
        }
    }
}>

export default async function ChatPage(props: ChatPageProps) {
    const params = await props.params;
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/auth/login?callbackUrl=/chat/" + params.chatId)
    }

    if (params.chatId === "new") {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { selectedClass: true, selectedSubject: true }
        })

        if (!user || !user.selectedClass || !user.selectedSubject) {
            redirect("/")
        }

        return (
            <ChatShell
                headerTitle={`${user.selectedSubject} • ${user.selectedClass}`}
                chatId="new"
            >
                <MessageList messages={[
                    {
                        id: "welcome",
                        role: "assistant", // Using string literal matching the type
                        content: `Hello! I'm your AI tutor for **${user.selectedSubject}** (${user.selectedClass}).\n\nHow can I help you regarding this subject today?`,
                        createdAt: new Date()
                    }
                ]} />
                <ChatComposer chatId="new" />
            </ChatShell>
        )
    }

    const chat = await prisma.chatSession.findUnique({
        where: { id: params.chatId },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            },
            user: {
                select: { email: true, name: true, image: true }
            }
        }
    })

    if (!chat) {
        notFound()
    }

    // Security check: ensure user owns chat
    if (chat.user.email !== session.user.email) {
        notFound() // Or redirect to 403
    }

    return (
        <ChatShell
            headerTitle={`${chat.subjectName} • ${chat.className}`}
            chatId={chat.id}
        >

            <MessageList messages={chat.messages.map((m: Message) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: m.createdAt
            }))} />

            <ChatComposer chatId={chat.id} />
        </ChatShell>
    )
}
