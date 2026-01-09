import { z } from 'zod';

// Assign Lecturer to Course DTO
export const courseInstructorAssignDTOSchema = z.object({
    courseId: z.string().uuid('Invalid course ID'),
    lecturerId: z.string().uuid('Invalid lecturer ID'),
    isPrimary: z.boolean().default(false),
});

export type CourseInstructorAssignDTO = z.infer<typeof courseInstructorAssignDTOSchema>;

// Update Course Instructor DTO
export const courseInstructorUpdateDTOSchema = z.object({
    isPrimary: z.boolean(),
});

export type CourseInstructorUpdateDTO = z.infer<typeof courseInstructorUpdateDTOSchema>;

// Response DTO with lecturer information
export interface CourseInstructorResponseDTO {
    id: string;
    courseId: string;
    lecturerId: string;
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
    courseId: string;
    instructors: CourseInstructorResponseDTO[];
    totalInstructors: number;
}
