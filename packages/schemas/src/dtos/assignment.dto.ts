import { z } from 'zod';
import { AssignmentStatus, assignmentSchema, submissionSchema, SubmissionStatus } from '../models/assignment.model';

// ============================================
// ASSIGNMENT DTOs
// ============================================

// Create Assignment DTO
export const createAssignmentDTOSchema = z.object({
  courseEditionId: z.string().uuid().optional(),
  courseRunId: z.string().uuid().optional(), // For live courses
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  maxScore: z.number().min(0).default(100),
  passingScore: z.number().min(0).optional(),
  dueDate: z.coerce.date().optional(),
  type: z.enum(['TEXT', 'FILE', 'BOTH']).default('TEXT'),
  rubric: z.unknown().optional(), // JSON rubric
  submissionSettings: z.unknown().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export type CreateAssignmentDTO = z.infer<typeof createAssignmentDTOSchema>;

// Update Assignment DTO
export const updateAssignmentDTOSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  maxScore: z.number().min(0).optional(),
  passingScore: z.number().min(0).optional(),
  dueDate: z.coerce.date().optional(),
  type: z.enum(['TEXT', 'FILE', 'BOTH']).optional(),
  rubric: z.unknown().optional(),
  submissionSettings: z.unknown().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export type UpdateAssignmentDTO = z.infer<typeof updateAssignmentDTOSchema>;

// Query Assignments DTO
export const queryAssignmentsDTOSchema = z.object({
  courseEditionId: z.string().uuid().optional(),
  courseRunId: z.string().uuid().optional(),
  status: z.nativeEnum(AssignmentStatus).optional(),
  q: z.string().optional(),
});

export type QueryAssignmentsDTO = z.infer<typeof queryAssignmentsDTOSchema>;

// ============================================
// SUBMISSION DTOs
// ============================================

// Submit Assignment DTO
export const submitAssignmentDTOSchema = z.object({
  assignmentId: z.string().uuid(),
  content: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
});

export type SubmitAssignmentDTO = z.infer<typeof submitAssignmentDTOSchema>;

// Grade Submission DTO
export const gradeSubmissionDTOSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional(),
  rubricGrades: z.unknown().optional(),
});

export type GradeSubmissionDTO = z.infer<typeof gradeSubmissionDTOSchema>;

// Return Submission DTO
export const returnSubmissionDTOSchema = z.object({
  feedback: z.string().optional(),
});

export type ReturnSubmissionDTO = z.infer<typeof returnSubmissionDTOSchema>;

// Query Submissions DTO
export const querySubmissionsDTOSchema = z.object({
  assignmentId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.nativeEnum(SubmissionStatus).optional(),
});

export type QuerySubmissionsDTO = z.infer<typeof querySubmissionsDTOSchema>;

// Response DTOs
export const assignmentResponseDTOSchema = assignmentSchema.extend({
  // Optional: User's submission status for this assignment (populated when fetching for authenticated user)
  userSubmissionStatus: z.nativeEnum(SubmissionStatus).optional(),
});

export type AssignmentResponseDTO = z.infer<typeof assignmentResponseDTOSchema>;

export const submissionResponseDTOSchema = submissionSchema;
export type SubmissionResponseDTO = z.infer<typeof submissionResponseDTOSchema>;
