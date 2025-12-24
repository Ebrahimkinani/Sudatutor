"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { chatService } from "@/services/chat-service"
import { sendMessageSchema } from "@/lib/validation/chat"

// --- Chat Creation ---

export async function createChatSession(_formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Not authenticated")
    }

    try {
        const newChat = await chatService.createSession(session.user.id)
        revalidatePath("/history")
        redirect(`/chat/${newChat.id}`)
    } catch (e) {
        // If it's a redirect, let it pass
        if ((e as any).digest?.startsWith('NEXT_REDIRECT')) throw e
        console.error(e)
        throw new Error("Failed to create chat")
    }
}

// --- Messaging ---

export async function sendMessage(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { error: "Not authenticated" }
    }

    const content = formData.get("content") as string
    const chatId = formData.get("chatId") as string
    const folderId = formData.get("folderId") as string | undefined

    const valid = sendMessageSchema.safeParse({ content, chatId, folderId })
    if (!valid.success) {
        return { error: "Invalid message" }
    }

    try {
        const result = await chatService.sendMessage(session.user.id, valid.data)

        if (chatId === "new") {
            // We need to client-side redirect, usually actions return data to client to redirect
            // OR we throw redirect here.
            redirect(`/chat/${result.chatId}`)
        }

        revalidatePath(`/chat/${result.chatId}`)
        return { success: true }

    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error
        console.error("Message error:", error)
        return { error: "Failed to send message" }
    }
}

// --- History ---

export async function deleteChat(chatId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return

    await chatService.deleteSession(session.user.id, chatId)
    revalidatePath("/history")
    revalidatePath("/")
}
