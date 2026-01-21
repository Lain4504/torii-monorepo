export * from './i-course.service';
export * from './i-live-session.service';
export * from './i-module.service';
export * from './i-lesson.service';
export * from './i-course-instructor.service';
export * from './i-lesson-material.service';
export * from './i-review.service';
export * from './i-wishlist.service';
export * from './i-exam.service';
export * from './i-enrollment.service';
export * from './i-comment.service';
export * from './i-post.service';
export * from './i-learning-progress.service';
export * from './i-flashcard.service';
export * from './i-flashcard-deck.service';

// Injection tokens for services
export const COURSE_SERVICE_TOKEN = Symbol('COURSE_SERVICE');
export const MODULE_SERVICE_TOKEN = Symbol('MODULE_SERVICE');
export const LESSON_SERVICE_TOKEN = Symbol('LESSON_SERVICE');
export const COURSE_INSTRUCTOR_SERVICE_TOKEN = Symbol('COURSE_INSTRUCTOR_SERVICE');
export const LESSON_MATERIAL_SERVICE_TOKEN = Symbol('LESSON_MATERIAL_SERVICE');
export const REVIEW_SERVICE_TOKEN = Symbol('REVIEW_SERVICE');
export const ENROLLMENT_SERVICE_TOKEN = Symbol('ENROLLMENT_SERVICE');
export const LIVE_SESSION_SERVICE_TOKEN = Symbol('LIVE_SESSION_SERVICE');