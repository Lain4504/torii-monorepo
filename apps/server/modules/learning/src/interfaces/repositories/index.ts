export * from './i-course.repository';
export * from './i-module.repository';
export * from './i-lesson.repository';
export * from './i-course-instructor.repository';
export * from './i-lesson-material.repository';
export * from './i-review.repository';
export * from './i-wishlist.repository';
export * from './i-exam.repository';
export * from './i-storage.repository';
export * from './i-comment.repository';
export * from './i-post.repository';

// Injection tokens for repositories
export const COURSE_REPOSITORY_TOKEN = Symbol('COURSE_REPOSITORY');
export const MODULE_REPOSITORY_TOKEN = Symbol('MODULE_REPOSITORY');
export const LESSON_REPOSITORY_TOKEN = Symbol('LESSON_REPOSITORY');
export const COURSE_INSTRUCTOR_REPOSITORY_TOKEN = Symbol('COURSE_INSTRUCTOR_REPOSITORY');
export const LESSON_MATERIAL_REPOSITORY_TOKEN = Symbol('LESSON_MATERIAL_REPOSITORY');
export const REVIEW_REPOSITORY_TOKEN = Symbol('REVIEW_REPOSITORY');
export { EXAM_REPOSITORY_TOKEN } from './i-exam.repository';
export { STORAGE_REPOSITORY_TOKEN } from './i-storage.repository';
