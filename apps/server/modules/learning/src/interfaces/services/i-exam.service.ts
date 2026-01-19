import type {
    ExamCreateDTO,
    ExamUpdateDTO,
    ExamQueryDTO,
    ExamResponseDTO,
    ExamSessionStartResponseDTO,
    ExamSessionAnswersDTO,
    ExamSessionResponseDTO,
    ExamWithStatusResponseDTO,
    ExamSessionQueryDTO,
    ExamSessionWithExamResponseDTO,
    PaginatedResponseDTO,
    Requester,
} from '@workspace/schemas';

/**
 * Exam Service Interface
 * Defines the contract for exam/quiz business logic operations
 */
export interface IExamService {
    /**
     * Find all exams with status information for learners
     */
    findAllWithStatus(query: ExamQueryDTO, userId?: string): Promise<PaginatedResponseDTO<ExamWithStatusResponseDTO>>;

    /**
     * Find all exams (admin/staff view)
     */
    findAll(query: ExamQueryDTO): Promise<PaginatedResponseDTO<ExamResponseDTO>>;

    /**
     * Find one exam by ID
     */
    findOne(examId: string): Promise<ExamResponseDTO>;

    /**
     * Create a new exam/quiz
     */
    create(requester: Requester, dto: ExamCreateDTO): Promise<ExamResponseDTO>;

    /**
     * Update an exam/quiz
     */
    update(requester: Requester, examId: string, dto: ExamUpdateDTO): Promise<ExamResponseDTO>;

    /**
     * Delete an exam/quiz
     */
    delete(requester: Requester, examId: string): Promise<void>;

    /**
     * Publish an exam/quiz
     */
    publish(requester: Requester, examId: string): Promise<ExamResponseDTO>;

    /**
     * Start an exam session
     */
    startExam(examId: string, userId: string): Promise<ExamSessionStartResponseDTO>;

    /**
     * Save exam session answers
     */
    saveAnswers(sessionId: string, userId: string, data: ExamSessionAnswersDTO): Promise<ExamSessionResponseDTO>;

    /**
     * Submit exam session
     */
    submitSession(sessionId: string, userId: string): Promise<ExamSessionResponseDTO>;

    /**
     * Get user's exam sessions (history)
     */
    getUserSessions(userId: string, query: ExamSessionQueryDTO): Promise<PaginatedResponseDTO<ExamSessionWithExamResponseDTO>>;

    /**
     * Get quiz statistics
     */
    getQuizStatistics(examId: string): Promise<any>;

    /**
     * Get all attempts for a quiz (admin/staff view)
     */
    getQuizAttempts(examId: string, query: ExamSessionQueryDTO): Promise<PaginatedResponseDTO<ExamSessionWithExamResponseDTO>>;

    /**
     * Get attempt details with explanations (if allowed)
     */
    getAttemptDetails(sessionId: string, userId: string): Promise<any>;

    /**
     * Get exam by ID with user session status (for learners)
     */
    getExamById(examId: string, userId?: string): Promise<ExamWithStatusResponseDTO>;

    /**
     * Get all sessions for a specific exam (for learners)
     */
    getExamSessions(examId: string, userId: string, query?: ExamSessionQueryDTO): Promise<PaginatedResponseDTO<ExamSessionWithExamResponseDTO>>;
}

export const EXAM_SERVICE_TOKEN = Symbol('EXAM_SERVICE');

