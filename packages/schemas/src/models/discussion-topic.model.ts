import { z } from 'zod';
import { baseModelSchema } from './base.model';

export enum DiscussionTopicStatus {
  OPEN = 'OPEN',
  ANSWERED = 'ANSWERED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum DiscussionTopicCategory {
  GENERAL = 'GENERAL',
  QUESTION = 'QUESTION',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export const discussionTopicModelSchema = baseModelSchema.extend({
  title: z.string().max(255),
  content: z.string(),
  authorId: z.string().uuid(),
  courseId: z.string().uuid(),
  moduleId: z.string().uuid().nullable().optional(),
  lessonId: z.string().uuid().nullable().optional(),
  category: z.nativeEnum(DiscussionTopicCategory).default(DiscussionTopicCategory.GENERAL),
  status: z.nativeEnum(DiscussionTopicStatus).default(DiscussionTopicStatus.OPEN),
  isPinned: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  viewCount: z.number().int().min(0).default(0),
  commentCount: z.number().int().min(0).default(0),
});

export type DiscussionTopic = z.infer<typeof discussionTopicModelSchema>;
