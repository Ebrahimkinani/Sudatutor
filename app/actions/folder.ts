"use server"

import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { revalidatePath } from "next/cache"

export async function createFolder(name: string, className?: string, subjectName?: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const folder = await prisma.folder.create({
        data: {
            name,
            userId: session.user.id,
            className,
            subjectName,
        },
    })

    revalidatePath("/")
    revalidatePath("/chat")
    return folder
}

export async function deleteFolder(folderId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Verify ownership
    const folder = await prisma.folder.findUnique({
        where: { id: folderId },
    })

    if (!folder || folder.userId !== session.user.id) {
        throw new Error("Unauthorized")
    }

    await prisma.folder.delete({
        where: { id: folderId },
    })

    revalidatePath("/")
    revalidatePath("/chat")
}

export async function updateFolder(folderId: string, name: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Verify ownership
    const folder = await prisma.folder.findUnique({
        where: { id: folderId },
    })

    if (!folder || folder.userId !== session.user.id) {
        throw new Error("Unauthorized")
    }

    await prisma.folder.update({
        where: { id: folderId },
        data: { name }
    })

    revalidatePath("/")
    revalidatePath("/chat")
}
