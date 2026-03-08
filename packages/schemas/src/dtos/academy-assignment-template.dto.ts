import { z } from 'zod';

export const academyAssignmentTemplateCreateDTOSchema = z.object({
    courseProfileId: z.string().uuid(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    defaultType: z.enum(['TEXT', 'FILE', 'BOTH']).default('TEXT'),
    defaultMaxScore: z.number().min(0).optional(),
    defaultRubric: z.unknown().optional(),
    defaultSubmissionSettings: z.unknown().optional(),
});
export type AcademyAssignmentTemplateCreateDTO = z.infer<
    typeof academyAssignmentTemplateCreateDTOSchema
>;

export const academyAssignmentTemplateUpdateDTOSchema = z.object({
    title: z.string().max(255).optional(),
    description: z.string().optional(),
    defaultType: z.enum(['TEXT', 'FILE', 'BOTH']).optional(),
    defaultMaxScore: z.number().min(0).optional(),
    defaultRubric: z.unknown().optional(),
    defaultSubmissionSettings: z.unknown().optional(),
});
export type AcademyAssignmentTemplateUpdateDTO = z.infer<
    typeof academyAssignmentTemplateUpdateDTOSchema
>;

export const academyAssignmentTemplateQueryDTOSchema = z.object({
    courseProfileId: z.string().uuid().optional(),
});
export type AcademyAssignmentTemplateQueryDTO = z.infer<
    typeof academyAssignmentTemplateQueryDTOSchema
>;

export type AcademyAssignmentTemplateModel = {
    id: string;
    courseProfileId: string;
    title: string;
    description?: string | null;
    defaultType: 'TEXT' | 'FILE' | 'BOTH';
    defaultMaxScore?: number | null;
    defaultRubric?: any | null;
    defaultSubmissionSettings?: any | null;
    createdAt: string;
    updatedAt: string;
};
