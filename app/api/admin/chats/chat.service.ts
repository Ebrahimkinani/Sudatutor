import { chatRepo } from "./chat.repo";
import { classRepo } from "../classes/class.repo";
import { subjectRepo } from "../subjects/subject.repo";

export class ChatService {
    async getChatsList(params: {
        classId?: string;
        subjectId?: string;
        q?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }) {
        const limit = params.limit || 20;
        const page = params.page || 1;
        // const skip = (page - 1) * limit;

        const fromDate = params.from ? new Date(params.from) : undefined;
        const toDate = params.to ? new Date(params.to) : undefined;

        const chats = await chatRepo.findAll({
            classId: params.classId,
            subjectId: params.subjectId,
            q: params.q,
            from: fromDate,
            to: toDate,
            limit,
            skip: (page - 1) * limit
        });

        // Count
        const total = await chatRepo.countAll({
            ...(params.classId && params.classId !== 'all' ? { classId: params.classId } : {}),
            ...(params.subjectId && params.subjectId !== 'all' ? { subjectId: params.subjectId } : {}),
            ...(params.from || params.to ? { lastMessageAt: { gte: fromDate, lte: toDate } } : {}),
        });

        const classes = await classRepo.findAll({ limit: 100 });
        let subjects: any[] = [];
        if (params.classId && params.classId !== 'all') {
            subjects = await subjectRepo.findAll({ classId: params.classId, limit: 100 });
        }

        return {
            chats,
            classes: classes.map((c: any) => ({ id: c.id, name: c.name })),
            subjects: subjects.map((s: any) => ({ id: s.id, name: s.name })),
            total,
            hasMore: total > (page * limit),
        }
    }

    async getSessionDetails(sessionId: string) {
        const session = await chatRepo.findById(sessionId);
        if (!session) return null;

        const messages = await chatRepo.findMessages({ sessionId, limit: 100 });

        return { session, messages };
    }
}

export const chatService = new ChatService();
