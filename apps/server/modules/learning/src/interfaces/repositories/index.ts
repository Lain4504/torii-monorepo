export * from './i-course.repository';
export * from './i-module.repository';
export * from './i-lesson.repository';
export * from './i-course-instructor.repository';
export * from './i-lesson-material.repository';
export * from './i-review.repository';
export * from './i-wishlist.repository';
export * from './i-exam.repository';
export * from './i-enrollment.repository';
export * from './i-order.repository';
export * from './i-comment.repository';
export * from './i-post.repository';
export * from './i-learning-progress.repository';

// Injection tokens for repositories
export const COURSE_REPOSITORY_TOKEN = Symbol('COURSE_REPOSITORY');
export const MODULE_REPOSITORY_TOKEN = Symbol('MODULE_REPOSITORY');
export const LESSON_REPOSITORY_TOKEN = Symbol('LESSON_REPOSITORY');
export const COURSE_INSTRUCTOR_REPOSITORY_TOKEN = Symbol('COURSE_INSTRUCTOR_REPOSITORY');
export const LESSON_MATERIAL_REPOSITORY_TOKEN = Symbol('LESSON_MATERIAL_REPOSITORY');
export const REVIEW_REPOSITORY_TOKEN = Symbol('REVIEW_REPOSITORY');
export { EXAM_REPOSITORY_TOKEN } from './i-exam.repository';
export const ENROLLMENT_REPOSITORY_TOKEN = Symbol('ENROLLMENT_REPOSITORY');
export const ORDER_REPOSITORY_TOKEN = Symbol('ORDER_REPOSITORY');
export const PAYMENT_REPOSITORY_TOKEN = ORDER_REPOSITORY_TOKEN; // Legacy