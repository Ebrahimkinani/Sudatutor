import { z } from "zod";

export const AnalyticsQuerySchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    classId: z.string().optional(),
    subjectId: z.string().optional(),
});

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
