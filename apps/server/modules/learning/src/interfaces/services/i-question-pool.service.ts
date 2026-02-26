import type {
    QuestionPoolResponseDTO,
    QuestionPoolCreateDTO,
    QuestionPoolUpdateDTO,
    QuestionPoolQueryDTO,
    PaginatedResponseDTO,
    Requester,
} from '@workspace/schemas';

/**
 * Question Pool Service Interface
 * Defines the contract for question pool business logic operations
 */
export interface IQuestionPoolService {
    /**
     * Find all pools with pagination and filters
     */
    findAll(query: QuestionPoolQueryDTO): Promise<PaginatedResponseDTO<QuestionPoolResponseDTO>>;

    /**
     * Find one pool by ID
     */
    findById(poolId: string): Promise<QuestionPoolResponseDTO>;

    /**
     * Create a new pool
     */
    create(requester: Requester, dto: QuestionPoolCreateDTO): Promise<QuestionPoolResponseDTO>;

    /**
     * Update pool
     */
    update(requester: Requester, poolId: string, dto: QuestionPoolUpdateDTO): Promise<QuestionPoolResponseDTO>;

    /**
     * Delete pool
     */
    delete(requester: Requester, poolId: string): Promise<{ message: string }>;

    /**
     * Get pools by course
     */
    getByCourse(courseId: string): Promise<QuestionPoolResponseDTO[]>;

    /**
     * Get pools by lesson
     */
    getByLesson(lessonId: string): Promise<QuestionPoolResponseDTO[]>;

    /**
     * Get pools by JLPT level
     */
    getByJlptLevel(jlptLevel: string): Promise<QuestionPoolResponseDTO[]>;
}

/**
 * Service token for dependency injection
 */
export const QUESTION_POOL_SERVICE_TOKEN = Symbol('QUESTION_POOL_SERVICE_TOKEN');

