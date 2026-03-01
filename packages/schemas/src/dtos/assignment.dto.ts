import { z } from 'zod';
import { AssignmentType, AssignmentStatus, assignmentSchema, submissionSchema, SubmissionStatus } from '../models/assignment.model';

// ============================================
// ASSIGNMENT DTOs
// ============================================

// Create Assignment DTO
export const createAssignmentDto = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  type: z.nativeEnum(AssignmentType).default(AssignmentType.TEXT),

  // At least one must be provided
  courseMasterId: z.preprocess((val) => (val === '' ? undefined : val), z.string().uuid().optional()),
  moduleId: z.preprocess((val) => (val === '' ? undefined : val), z.string().uuid().optional()),
  lessonId: z.preprocess((val) => (val === '' ? undefined : val), z.string().uuid().optional()),

  // Grading config
  maxScore: z.number().min(0).max(1000).default(100),
  passingScore: z.number().min(0).max(1000).optional(),

  // Deadlines
  dueDate: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().datetime().optional()
  ),
  allowLateSubmission: z.boolean().default(true),
  latePenaltyPercent: z.number().min(0).max(100).optional(),

  // File upload config
  allowedFileTypes: z.array(z.string()).default([]),
  maxFileSize: z.number().min(1048576).max(104857600).optional(), // 1MB - 100MB
  maxFiles: z.number().min(1).max(20).optional(),

  // Metadata
  instructions: z.string().optional(),
  attachmentUrls: z.array(z.string().url()).default([]),
}).refine(
  (data) => data.courseMasterId || data.moduleId || data.lessonId,
  {
    message: 'At least one of courseMasterId, moduleId, or lessonId must be provided',
  }
).refine(
  (data) => !data.passingScore || data.passingScore <= data.maxScore,
  {
    message: 'Passing score must be less than or equal to max score',
  }
);

export type CreateAssignmentDto = z.infer<typeof createAssignmentDto>;

// Update Assignment DTO (all fields optional, no validation rules)
export const updateAssignmentDto = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  type: z.nativeEnum(AssignmentType).optional(),

  courseMasterId: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().uuid().optional()),
  moduleId: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().uuid().optional()),
  lessonId: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().uuid().optional()),

  maxScore: z.number().min(0).max(1000).optional(),
  passingScore: z.number().min(0).max(1000).optional(),

  dueDate: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().datetime().optional()
  ),
  allowLateSubmission: z.boolean().optional(),
  latePenaltyPercent: z.number().min(0).max(100).optional(),

  allowedFileTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().min(1048576).max(104857600).optional(),
  maxFiles: z.number().min(1).max(20).optional(),

  instructions: z.string().optional(),
  attachmentUrls: z.array(z.string().url()).optional(),
});

export type UpdateAssignmentDto = z.infer<typeof updateAssignmentDto>;

// Query Assignments DTO
export const queryAssignmentsDto = z.object({
  courseMasterId: z.string().uuid().optional(),
  moduleId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  status: z.nativeEnum(AssignmentStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type QueryAssignmentsDto = z.infer<typeof queryAssignmentsDto>;

// ============================================
// SUBMISSION DTOs
// ============================================

// Submit Assignment DTO (create/update draft)
export const submitAssignmentDto = z.object({
  textAnswer: z.string().optional(),
  fileUrls: z.array(z.string()).default([]), // Accept any string, not just URLs
});

export type SubmitAssignmentDto = z.infer<typeof submitAssignmentDto>;

// Grade Submission DTO
export const gradeSubmissionDto = z.object({
  score: z.number().min(0).max(1000),
  feedback: z.string().max(5000).optional().or(z.literal('')),
  reason: z.string().max(1000).optional(), // Reason for grading or re-grading
});

export type GradeSubmissionDto = z.infer<typeof gradeSubmissionDto>;

// Return Submission DTO
export const returnSubmissionDto = z.object({
  feedback: z.string().min(1).max(5000), // Required when returning
});

export type ReturnSubmissionDto = z.infer<typeof returnSubmissionDto>;

// Query Submissions DTO
export const querySubmissionsDto = z.object({
  assignmentId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.nativeEnum(SubmissionStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type QuerySubmissionsDto = z.infer<typeof querySubmissionsDto>;

// Response DTOs
export const assignmentResponseDto = assignmentSchema.extend({
  // Optional: User's submission status for this assignment (populated when fetching for authenticated user)
  userSubmissionStatus: z.nativeEnum(SubmissionStatus).optional(),
});
export type AssignmentResponseDTO = z.infer<typeof assignmentResponseDto>;

export const submissionResponseDto = submissionSchema;
export type SubmissionResponseDTO = z.infer<typeof submissionResponseDto>;
