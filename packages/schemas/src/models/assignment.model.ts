import { z } from 'zod';

// Assignment Types
export enum AssignmentType {
  TEXT = 'TEXT', // Text answer only
  FILE = 'FILE', // File upload only
  BOTH = 'BOTH', // Text + File
}

// Assignment Status
export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

// Submission Status
export enum SubmissionStatus {
  DRAFT = 'DRAFT', // Đang soạn (chưa nộp)
  SUBMITTED = 'SUBMITTED', // Đã nộp
  GRADED = 'GRADED', // Đã chấm
  RETURNED = 'RETURNED', // Trả lại để sửa
}

// Assignment Schema
export const assignmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  type: z.nativeEnum(AssignmentType),

  // Associated with (at least one required)
  courseId: z.string().uuid().optional(),
  moduleId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),

  // Grading config
  maxScore: z.number(),
  passingScore: z.number().optional(),

  // Deadlines
  dueDate: z.date().optional(),
  allowLateSubmission: z.boolean(),
  latePenaltyPercent: z.number().optional(), // Optional reference

  // File upload config
  allowedFileTypes: z.array(z.string()),
  maxFileSize: z.number().optional(),
  maxFiles: z.number().optional(),

  // Metadata
  instructions: z.string().optional(),
  attachmentUrls: z.array(z.string()),
  createdBy: z.string().uuid(),
  status: z.nativeEnum(AssignmentStatus), 
  publishedAt: z.date().optional().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Assignment = z.infer<typeof assignmentSchema>;

// Submission Schema
export const submissionSchema = z.object({
  id: z.string().uuid(),
  assignmentId: z.string().uuid(),
  userId: z.string().uuid(),

  // Submission content
  textAnswer: z.string().optional(),
  fileUrls: z.array(z.string()),

  // Status tracking
  status: z.nativeEnum(SubmissionStatus),
  submittedAt: z.date().optional(),
  isLate: z.boolean(),
  daysLate: z.number().optional(),

  // Grading
  score: z.number().optional(),
  feedback: z.string().optional(),
  gradedBy: z.string().uuid().optional(),
  gradedAt: z.date().optional(),

  // History tracking
  attemptNumber: z.number(),
  previousSubmissionId: z.string().uuid().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Submission = z.infer<typeof submissionSchema>;
