import { z } from "zod"

export const createMessageSchema = z.object({
    content: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
    chatId: z.string().min(1),
    folderId: z.string().optional(),
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>

export const createSessionSchema = z.object({
    subject: z.string().min(1),
    className: z.string().min(1),
})
