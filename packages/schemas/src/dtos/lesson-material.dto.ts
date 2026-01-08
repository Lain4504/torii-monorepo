import { z } from 'zod';

// Material type enum based on requirements
export const materialTypes = ['slides', 'video', 'reading', 'assignment'] as const;
export type MaterialType = typeof materialTypes[number];

// Allowed MIME types for file uploads
export const ALLOWED_MIME_TYPES = [
    'application/pdf',               // PDF
    'application/vnd.ms-powerpoint', // PPT
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'video/mp4',                     // MP4
    'image/png',                     // PNG
    'image/jpeg',                    // JPEG
] as const;

export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'ppt', 'pptx', 'mp4', 'png', 'jpg', 'jpeg'] as const;

// Create Lesson Material DTO
export const lessonMaterialCreateDTOSchema = z.object({
    lessonId: z.string().uuid('Invalid lesson ID'),
    type: z.enum(materialTypes, {
        errorMap: () => ({ message: 'Type must be one of: slides, video, reading, assignment' }),
    }),
    title: z.string().max(255, 'Title must be 255 characters or less').optional(),
    mimeType: z.string().optional(),
    fileName: z.string().max(255, 'File name must be 255 characters or less').optional(),
});

export type LessonMaterialCreateDTO = z.infer<typeof lessonMaterialCreateDTOSchema>;

// Update Lesson Material DTO
export const lessonMaterialUpdateDTOSchema = z.object({
    title: z.string().max(255, 'Title must be 255 characters or less').optional(),
    orderIndex: z.number().int().nonnegative('Order index must be a non-negative integer').optional(),
    type: z.enum(materialTypes).optional(),
});

export type LessonMaterialUpdateDTO = z.infer<typeof lessonMaterialUpdateDTOSchema>;

// Response DTO with file asset information
export interface LessonMaterialResponseDTO {
    id: string;
    lessonId: string;
    fileAssetId: string;
    type: MaterialType;
    title: string | null;
    orderIndex: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;

    // File asset details
    fileAsset: {
        id: string;
        fileUrl: string;
        mimeType: string | null;
        fileSize: bigint | null;
        status: string;
    };
}

// Grouped materials response
export interface LessonMaterialsGroupedResponseDTO {
    lessonId: string;
    materials: {
        slides: LessonMaterialResponseDTO[];
        video: LessonMaterialResponseDTO[];
        reading: LessonMaterialResponseDTO[];
        assignment: LessonMaterialResponseDTO[];
    };
}

// Validation helper
export function isAllowedMimeType(mimeType: string): boolean {
    return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function getErrorMessage(): string {
    return `Invalid file type. Allowed: PDF, PPT, PPTX, MP4, PNG, JPEG`;
}
