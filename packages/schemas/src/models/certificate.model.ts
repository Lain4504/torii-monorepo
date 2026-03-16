import { z } from 'zod';

export const certificateSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    classId: z.string().uuid(),
    enrollmentId: z.string().uuid(),
    certificateCode: z.string().max(50),
    issueDate: z.date(),
    fileUrl: z.string(),
    metadata: z.any().optional(),
});

export type Certificate = z.infer<typeof certificateSchema>;
