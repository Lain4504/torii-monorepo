export * from './i-course.service';
export * from './i-module.service';
export * from './i-lesson.service';
export * from './i-course-instructor.service';
export * from './i-lesson-material.service';
export * from './i-review.service';
export * from './i-wishlist.service';


// Injection tokens for services
export const COURSE_SERVICE_TOKEN = Symbol('COURSE_SERVICE');
export const MODULE_SERVICE_TOKEN = Symbol('MODULE_SERVICE');
export const LESSON_SERVICE_TOKEN = Symbol('LESSON_SERVICE');
export const COURSE_INSTRUCTOR_SERVICE_TOKEN = Symbol('COURSE_INSTRUCTOR_SERVICE');
export const LESSON_MATERIAL_SERVICE_TOKEN = Symbol('LESSON_MATERIAL_SERVICE');
