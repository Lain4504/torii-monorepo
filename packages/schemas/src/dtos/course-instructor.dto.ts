import { z } from 'zod';
import { InstructorRole } from '../models/course-master.model';

// Assign Lecturer to Course DTO
export const courseInstructorAssignDTOSchema = z.object({
    courseMasterId: z.string().uuid('Invalid course master ID'),
    lecturerId: z.string().uuid('Invalid lecturer ID'),
    role: z.nativeEnum(InstructorRole).default(InstructorRole.MAIN),
    isPrimary: z.boolean().default(false),
});

export type CourseInstructorAssignDTO = z.infer<typeof courseInstructorAssignDTOSchema>;

// Update Course Instructor DTO
export const courseInstructorUpdateDTOSchema = z.object({
    role: z.nativeEnum(InstructorRole).optional(),
    isPrimary: z.boolean().optional(),
});

export type CourseInstructorUpdateDTO = z.infer<typeof courseInstructorUpdateDTOSchema>;

// Response DTO with lecturer information
export interface CourseInstructorResponseDTO {
    id: string;
    courseMasterId: string;
    lecturerId: string;
    role: InstructorRole;
    isPrimary: boolean;
    assignedDate: Date;

    // Lecturer details (populated from User table)
    lecturer?: {
        id: string;
        email: string;
        displayName: string;
        avatarUrl: string | null;
    };

    // Course details (optional, for lecturer's course list)
    course?: {
        id: string;
        title: string;
        slug: string;
        thumbnailUrl: string | null;
        status: string;
    };
}

// List response for course instructors
export interface CourseInstructorsListResponseDTO {
    courseMasterId: string;
    instructors: CourseInstructorResponseDTO[];
    totalInstructors: number;
}
