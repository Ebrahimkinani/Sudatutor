import { chatRepository } from "@/repositories/chat-repository"
import { prisma } from "@/lib/db/prisma"
import { userService } from "@/services/user-service"
import { createSessionSchema, sendMessageSchema, CreateSessionInput, SendMessageInput } from "@/lib/validation/chat"
import { AppError, ERROR_CODES } from "@/lib/errors"
import { logger } from "@/lib/observability/logger"

export class ChatService {

    async createSession(userId: string, input?: { folderId?: string }) {
        // 1. Get Context
        const user = await userService.getUserContext(userId)
        if (!user.selectedClass || !user.selectedSubject) {
            throw new AppError("No class or subject selected", ERROR_CODES.VALIDATION_ERROR)
        }

        const welcomeText = `Hello! I'm your AI tutor for **${user.selectedSubject}** (${user.selectedClass}).\n\nHow can I help you regarding this subject today?`

        // 2. Resolve Class and Subject IDs
        // This logic assumes we want to auto-create them if missing, or we should have them from a setup phase.
        // For robustness in this MVP phase, we will find-or-create.

        // Note: In a real app, we might want to query by ID if selectedClass stored ID, but it stores name.
        const classRecord = await prisma.class.findFirst({ where: { name: user.selectedClass } })
            || await prisma.class.create({ data: { name: user.selectedClass } });

        const subjectRecord = await prisma.subject.findFirst({
            where: { name: user.selectedSubject, classId: classRecord.id }
        }) || await prisma.subject.create({
            data: { name: user.selectedSubject, classId: classRecord.id }
        });

        // 3. Create Session via Repository
        const session = await chatRepository.createSession({
            user: { connect: { id: userId } },
            class: { connect: { id: classRecord.id } },
            subject: { connect: { id: subjectRecord.id } },
            folder: input?.folderId ? { connect: { id: input.folderId } } : undefined,
            title: `${user.selectedSubject} - ${user.selectedClass}`,
            className: user.selectedClass,
            subjectName: user.selectedSubject,
            lastMessageAt: new Date(),
            messages: {
                create: [
                    { role: "assistant", content: welcomeText }
                ]
            }
        })

        logger.info("Chat Session Created", { userId, sessionId: session.id })
        return session
    }

    async sendMessage(userId: string, input: SendMessageInput) {
        // 1. Validate Input (Zod Service Level Check optional if strict)
        // input is already typed but runtime check good practice
        const valid = sendMessageSchema.safeParse(input)
        if (!valid.success) {
            throw new AppError("Invalid input", ERROR_CODES.VALIDATION_ERROR)
        }

        let chatId = input.chatId

        if (chatId === "new") {
            const session = await this.createSession(userId, { folderId: input.folderId })
            chatId = session.id
        }

        // 2. Auth Check
        const isOwner = await chatRepository.isOwner(chatId, userId)
        if (!isOwner) {
            throw new AppError("Access Denied", ERROR_CODES.FORBIDDEN, 403)
        }

        // 3. AI Logic (Mocked for now)
        const aiResponse = `Echo: ${input.content}`

        // 4. Persistence
        await chatRepository.addExchange(chatId, input.content, aiResponse)

        return { chatId }
    }

    async getSession(userId: string, sessionId: string) {
        const isOwner = await chatRepository.isOwner(sessionId, userId)
        if (!isOwner) throw new AppError("Not Found", ERROR_CODES.NOT_FOUND, 404)

        return chatRepository.findSessionById(sessionId)
    }

    async deleteSession(userId: string, sessionId: string) {
        const isOwner = await chatRepository.isOwner(sessionId, userId)
        if (!isOwner) return // idempotent
        await chatRepository.deleteSession(sessionId)
    }
}

export const chatService = new ChatService()
