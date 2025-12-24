import { subjectRepo } from "./subject.repo";
import { classRepo } from "../classes/class.repo";

export class SubjectService {
    async getSubjectsList(params: {
        classId?: string;
        from?: string;
        to?: string;
        q?: string;
        page?: number;
        limit?: number;
    }) {
        const limit = params.limit || 20;
        const page = params.page || 1;
        const skip = (page - 1) * limit;

        const fromDate = params.from ? new Date(params.from) : new Date(0);
        const toDate = params.to ? new Date(params.to) : new Date();

        const subjects = await subjectRepo.listWithStats({
            classId: params.classId,
            q: params.q,
            from: fromDate,
            to: toDate,
            take: limit,
            skip,
        });

        // Count for pagination
        const total = await subjectRepo.countAll({
            ...(params.classId && params.classId !== 'all' ? { classId: params.classId } : {}),
            ...(params.q ? { name: { contains: params.q, mode: 'insensitive' } } : {})
        });

        // Also fetch classes for the dropdown filter
        const allClasses = await classRepo.findAll({ limit: 100 });
        // Limit 100 for now, if more we need searchable dropdown or async select

        return {
            subjects,
            allClasses: allClasses.map(c => ({ id: c.id, name: c.name })),
            total,
            hasMore: total > skip + limit,
        }
    }

    async createSubject(data: { name: string; classId: string; isActive?: boolean }) {
        return subjectRepo.create(data);
    }

    async updateSubject(id: string, data: { name?: string; isActive?: boolean }) {
        return subjectRepo.update(id, data);
    }

    async deleteSubject(id: string) {
        return subjectRepo.delete(id);
    }
}

export const subjectService = new SubjectService();
