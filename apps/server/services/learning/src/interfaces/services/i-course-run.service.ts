import type { CourseRunResponseDTO, CourseRunCreateDTO, CourseRunUpdateDTO, CourseRunSearchRequestDTO, PaginatedApiResponse, Requester, CourseRunStatus } from '@workspace/schemas';

export interface ICourseRunService {
    /**
     * Create data.
     */
    create(requester: Requester, dto: CourseRunCreateDTO): Promise<CourseRunResponseDTO>;
    /**
     * Update data.
     */
    update(requester: Requester, id: string, dto: CourseRunUpdateDTO): Promise<CourseRunResponseDTO>;
    /**
     * Update status.
     */
    updateStatus(requester: Requester, id: string, status: CourseRunStatus): Promise<CourseRunResponseDTO>;
    /**
     * Submit a course run for content review (Lecturer action).
     */
    submitForContentReview(requester: Requester, id: string): Promise<CourseRunResponseDTO>;
    /**
     * Review course run content (Staff-LMS action).
     */
    reviewRunContent(
        requester: Requester,
        id: string,
        payload: {
            outcome: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUIRED';
            checklist?: Record<string, any>;
            comments?: string;
            rejectionReason?: string;
            moveToPlanning?: boolean;
            moveToEnrolling?: boolean;
        },
    ): Promise<CourseRunResponseDTO>;
    /**
     * Find by id.
     */
    findById(id: string): Promise<CourseRunResponseDTO>;
    /**
     * Find by slug.
     */
    findBySlug(slug: string): Promise<CourseRunResponseDTO>;
    /**
     * Find all.
     */
    findAll(query: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>>;
    /**
     * Find my runs.
     */
    findMyRuns(requester: Requester, query: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>>;
    /**
     * Get students by course run.
     */
    getStudentsByCourseRun(id: string, page?: number, limit?: number): Promise<any>;
    /**
     * Get all run lessons (CourseRunLesson) for a course run.
     */
    getRunLessons(requester: Requester, id: string): Promise<any>;
    /**
     * Update content for a single run lesson.
     */
    updateRunLesson(
        requester: Requester,
        courseRunId: string,
        lessonId: string,
        payload: {
            videoUrl?: string | null;
            videoDuration?: number | null;
            articleContent?: string | null;
            recordingUrl?: string | null;
            isUnlocked?: boolean;
        },
    ): Promise<any>;
    /**
     * Delete data.
     */
    delete(requester: Requester, id: string): Promise<void>;
}
