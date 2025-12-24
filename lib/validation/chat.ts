import { z } from "zod"

export const createSessionSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    className: z.string().min(1, "Class Name is required"),
    folderId: z.string().optional(), // Mongo ID format validation if simple string check
})

export const sendMessageSchema = z.object({
    chatId: z.string().min(1),
    content: z.string().min(1, "Message cannot be empty").max(4000, "Message too long"),
    folderId: z.string().optional(),
})

export const paginationSchema = z.object({
    limit: z.number().min(1).max(50).default(20),
    cursor: z.string().optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
