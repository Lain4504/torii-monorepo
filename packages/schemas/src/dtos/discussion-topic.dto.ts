import { z } from 'zod';
import { paginationQuerySchema } from './common.dto';

export const discussionTopicCreateDTOSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  courseId: z.string().uuid('Invalid Course ID'),
  moduleId: z.string().uuid('Invalid Module ID').nullable().optional(),
  lessonId: z.string().uuid('Invalid Lesson ID').nullable().optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export type DiscussionTopicCreateDTO = z.infer<typeof discussionTopicCreateDTOSchema>;

export const discussionTopicUpdateDTOSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).optional(),
  content: z.string().min(1, 'Content is required').optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export type DiscussionTopicUpdateDTO = z.infer<typeof discussionTopicUpdateDTOSchema>;

export const discussionTopicQueryDTOSchema = paginationQuerySchema.extend({
  courseId: z.string().uuid('Invalid Course ID').optional(),
  moduleId: z.string().uuid('Invalid Module ID').nullable().optional(),
  lessonId: z.string().uuid('Invalid Lesson ID').nullable().optional(),
  authorId: z.string().uuid('Invalid Author ID').optional(),
  sortBy: z.enum(['createdAt', 'viewCount', 'commentCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type DiscussionTopicQueryDTO = z.infer<typeof discussionTopicQueryDTOSchema>;

export const discussionTopicResponseDTOSchema = discussionTopicModelSchema.extend({
  author: z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    avatarUrl: z.string().nullable().optional(),
  }).optional(),
  isLiked: z.boolean().optional(), // No likes for now on DiscussionTopic, but keep for compatibility
  replies: z.array(z.lazy(() => discussionTopicResponseDTOSchema)).optional(), // Self-referencing replies
});

export type DiscussionTopicResponseDTO = z.infer<typeof discussionTopicResponseDTOSchema>;

export const discussionTopicPaginatedResponseSchema = z.object({
  data: z.array(discussionTopicResponseDTOSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

export type DiscussionTopicPaginatedResponse = z.infer<typeof discussionTopicPaginatedResponseSchema>;
