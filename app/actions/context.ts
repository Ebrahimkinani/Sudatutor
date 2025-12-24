"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const contextSchema = z.object({
    className: z.string().min(1, "Class is required"),
    subjectName: z.string().min(1, "Subject is required"),
    folderId: z.string().optional(),
})

export type ContextState = {
    success: boolean
    message?: string
}

export async function saveContext(prevState: ContextState, formData: FormData): Promise<ContextState> {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return { success: false, message: "Not authenticated" }
    }

    const rawData = {
        className: formData.get("className"),
        subjectName: formData.get("subjectName"),
        folderId: formData.get("folderId") || undefined,
    }

    const validatedData = contextSchema.safeParse(rawData)

    if (!validatedData.success) {
        return { success: false, message: "Invalid class or subject" }
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                selectedClass: validatedData.data.className,
                selectedSubject: validatedData.data.subjectName,
            },
            select: { id: true }
        })

        revalidatePath("/")

    } catch (error) {
        console.error("Failed to save context:", error)
        return { success: false, message: "Failed to save selection" }
    }

    const params = new URLSearchParams()
    if (validatedData.data.folderId) {
        params.set("folderId", validatedData.data.folderId as string)
    }
    redirect(`/chat/new?${params.toString()}`)
}

export async function resetContext(_formData: FormData) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                selectedClass: null,
                selectedSubject: null,
            },
        })
        revalidatePath("/")
    } catch (error) {
        console.error("Failed to reset context:", error)
    }
}
