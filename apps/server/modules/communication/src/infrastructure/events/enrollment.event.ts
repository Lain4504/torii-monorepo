/**
 * Course Enrollment Success Event
 * Emitted when a user successfully enrolls in a course (especially free ones)
 */
export interface CourseEnrollmentSuccessEvent {
    userId: string;
    userEmail: string;
    userName: string;
    courseId: string;
    courseName: string;
    enrollmentId: string;
}
