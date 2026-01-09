import type {
    QuestionResponseDTO,
    QuestionCreateDTO,
    QuestionUpdateDTO,
    QuestionQueryDTO,
    PaginatedResponseDTO,
    Requester,
} from '@workspace/schemas';

/**
 * Question Service Interface
 * Defines the contract for question business logic operations
 */
export interface IQuestionService {
    /**
     * Find all questions with pagination and filters
     */
    findAll(query: QuestionQueryDTO): Promise<PaginatedResponseDTO<QuestionResponseDTO>>;

    /**
     * Find one question by ID
     */
    findOne(questionId: string): Promise<QuestionResponseDTO>;

    /**
     * Create a new question
     */
    create(requester: Requester, dto: QuestionCreateDTO): Promise<QuestionResponseDTO>;

    /**
     * Create multiple questions (bulk)
     */
    createMany(requester: Requester, dtos: QuestionCreateDTO[]): Promise<{ count: number; created: QuestionResponseDTO[] }>;

    /**
     * Update question
     */
    update(requester: Requester, questionId: string, dto: QuestionUpdateDTO): Promise<QuestionResponseDTO>;

    /**
     * Update multiple questions (bulk)
     */
    updateMany(requester: Requester, questionIds: string[], dto: QuestionUpdateDTO): Promise<{ count: number }>;

    /**
     * Delete question
     */
    delete(requester: Requester, questionId: string): Promise<{ message: string }>;

    /**
     * Delete multiple questions (bulk)
     */
    deleteMany(requester: Requester, questionIds: string[]): Promise<{ count: number }>;

    /**
     * Approve question (change status to active)
     */
    approve(requester: Requester, questionId: string): Promise<QuestionResponseDTO>;

    /**
     * Deactivate question (change status to inactive)
     */
    deactivate(requester: Requester, questionId: string): Promise<QuestionResponseDTO>;

    /**
     * Reject question (change status to archived)
     */
    reject(requester: Requester, questionId: string): Promise<QuestionResponseDTO>;

    /**
     * Send question for review (change status to review)
     */
    sendForReview(requester: Requester, questionId: string): Promise<QuestionResponseDTO>;

    /**
     * Get questions by category
     */
    getByCategory(category: string): Promise<QuestionResponseDTO[]>;

    /**
     * Get questions by JLPT level
     */
    getByJlptLevel(jlptLevel: string): Promise<QuestionResponseDTO[]>;

    /**
     * Get questions by status
     */
    getByStatus(status: string): Promise<QuestionResponseDTO[]>;

    /**
     * Get questions by pool
     */
    getByPool(poolId: string): Promise<QuestionResponseDTO[]>;
}

/**
 * Service token for dependency injection
 */
export const QUESTION_SERVICE_TOKEN = Symbol('QUESTION_SERVICE_TOKEN');

