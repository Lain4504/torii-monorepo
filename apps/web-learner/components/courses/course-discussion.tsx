'use client'

import { LessonDiscussion } from './lesson-discussion'

export function CourseDiscussion({ classId }: { classId: string }) {
  // Legacy: "discussionId" maps to `Class.id` for course-level threads.
  // We reuse LessonDiscussion UI because it already implements the 2-level
  // structure: topics targeted to discussionId, answers targeted to topic.id.
  return <LessonDiscussion classId={classId} lessonId={classId} />
}

