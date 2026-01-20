import {
    Injectable,
    Logger,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import type { Question } from '@prisma/generated';
import {
    UserRole,
    QuestionStatus,
    QuestionType,
} from '@workspace/schemas';
import type {
    QuestionCreateDTO,
    QuestionUpdateDTO,
    QuestionQueryDTO,
    QuestionResponseDTO,
    PaginatedResponseDTO,
    Requester,
} from '@workspace/schemas';
import type { IQuestionService } from '../../interfaces/services/i-question.service';
import type { IQuestionRepository } from '../../interfaces/repositories/i-question.repository';
import { QUESTION_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-question.repository';

/**
 * Question Service
 * Handles question business logic operations
 */
@Injectable()
export class QuestionService implements IQuestionService {
    private readonly logger = new Logger(QuestionService.name);

    constructor(
        @Inject(QUESTION_REPOSITORY_TOKEN)
        private readonly questionRepository: IQuestionRepository,
    ) { }

    /**
     * Map Question entity to QuestionResponseDTO
     */
    private toQuestionDto(question: Question): QuestionResponseDTO {
        return {
            id: question.id,
            poolId: question.poolId || undefined,
            questionText: question.questionText,
            questionType: question.questionType as QuestionType,
            jlptLevel: question.jlptLevel as any,
            category: question.category as any,
            subcategory: question.subcategory || undefined,
            difficulty: question.difficulty as any,
            options: question.options as any,
            correctAnswer: question.correctAnswer || undefined,
            explanation: question.explanation || undefined,
            metadata: question.metadata as any,
            tags: question.tags || [],
            createdBy: question.createdBy || undefined,
            status: question.status as QuestionStatus,
            usageCount: question.usageCount,
            createdAt: question.createdAt,
            updatedAt: question.updatedAt,
        };
    }

    /**
     * Validate question data
     */
    private validateQuestion(dto: QuestionCreateDTO | QuestionUpdateDTO): void {
        // Validate multiple choice questions have options
        if (dto.questionType === QuestionType.MULTIPLE_CHOICE) {
            if (!dto.options || Object.keys(dto.options).length < 2) {
                throw new BadRequestException('Multiple choice questions must have at least 2 options');
            }
        }

        // Validate correct answer is provided for non-essay questions
        if (dto.questionType !== QuestionType.ESSAY && !dto.correctAnswer) {
            throw new BadRequestException('Correct answer is required for non-essay questions');
        }

        // Validate options format for multiple choice
        if (dto.options && dto.questionType === QuestionType.MULTIPLE_CHOICE) {
            const optionKeys = Object.keys(dto.options);
            if (optionKeys.length === 0) {
                throw new BadRequestException('Multiple choice questions must have options');
            }
        }
    }

    /**
     * Check if user has permission to manage questions
     */
    private checkPermission(requester: Requester, action: string): void {
        const hasPermission = requester.permissions?.includes('*') || requester.permissions?.includes('exam.manage');
        if (!hasPermission) {
            throw new ForbiddenException(`Only authorized staff can ${action} questions`);
        }
    }

    /**
     * Check if question is in use (has usage count > 0)
     */
    private async checkQuestionInUse(questionId: string): Promise<boolean> {
        const question = await this.questionRepository.findById(questionId);
        return question ? question.usageCount > 0 : false;
    }

    /**
     * Find all questions with pagination and filters
     */
    async findAll(query: QuestionQueryDTO): Promise<PaginatedResponseDTO<QuestionResponseDTO>> {
        try {
            const {
                page = 1,
                limit = 10,
                questionType,
                jlptLevel,
                difficulty,
                category,
                poolId,
                search,
                status,
                tags,
            } = query;

            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;

            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 10;

            const skip = (validPage - 1) * validLimit;

            const whereClause: any = {};

            if (questionType) {
                whereClause.questionType = questionType;
            }

            if (jlptLevel) {
                whereClause.jlptLevel = jlptLevel;
            }

            if (difficulty) {
                whereClause.difficulty = difficulty;
            }

            if (category) {
                whereClause.category = category;
            }

            if (poolId) {
                whereClause.poolId = poolId;
            }

            if (status) {
                whereClause.status = status;
            }

            if (search) {
                whereClause.OR = [
                    { questionText: { contains: search, mode: 'insensitive' } },
                    { explanation: { contains: search, mode: 'insensitive' } },
                ];
            }

            if (tags && tags.length > 0) {
                whereClause.tags = { hasSome: tags };
            }

            const [total, questions] = await Promise.all([
                this.questionRepository.count(whereClause),
                this.questionRepository.findMany({
                    skip,
                    take: validLimit,
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: questions.map((q) => this.toQuestionDto(q)),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching questions: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to fetch questions: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Find one question by ID
     */
    async findOne(questionId: string): Promise<QuestionResponseDTO> {
        const question = await this.questionRepository.findById(questionId);

        if (!question) {
            throw new NotFoundException(`Question with id ${questionId} not found`);
        }

        return this.toQuestionDto(question);
    }

    /**
     * Create a new question
     */
    async create(requester: Requester, dto: QuestionCreateDTO): Promise<QuestionResponseDTO> {
        this.checkPermission(requester, 'create');

        // Validate question data
        this.validateQuestion(dto);

        try {
            const question = await this.questionRepository.create({
                questionText: dto.questionText,
                questionType: dto.questionType,
                poolId: dto.poolId || null,
                jlptLevel: dto.jlptLevel || null,
                category: dto.category || null,
                subcategory: dto.subcategory || null,
                difficulty: dto.difficulty || null,
                options: dto.options,
                correctAnswer: dto.correctAnswer || null,
                explanation: dto.explanation || null,
                metadata: dto.metadata,
                tags: dto.tags || [],
                createdBy: requester.sub,
                status: QuestionStatus.ACTIVE,
                usageCount: 0,
            });

            this.logger.log(`Question ${question.id} created by ${requester.sub}`);
            return this.toQuestionDto(question);
        } catch (error: any) {
            this.logger.error(`Error creating question: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to create question: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Create multiple questions (bulk)
     */
    async createMany(requester: Requester, dtos: QuestionCreateDTO[]): Promise<{ count: number; created: QuestionResponseDTO[] }> {
        this.checkPermission(requester, 'create');

        if (!dtos || dtos.length === 0) {
            throw new BadRequestException('No questions provided');
        }

        if (dtos.length > 100) {
            throw new BadRequestException('Cannot create more than 100 questions at once');
        }

        // Validate all questions
        dtos.forEach((dto, index) => {
            try {
                this.validateQuestion(dto);
            } catch (error: any) {
                throw new BadRequestException(`Question at index ${index} is invalid: ${error.message}`);
            }
        });

        try {
            const data = dtos.map((dto) => ({
                questionText: dto.questionText,
                questionType: dto.questionType,
                poolId: dto.poolId || null,
                jlptLevel: dto.jlptLevel || null,
                category: dto.category || null,
                subcategory: dto.subcategory || null,
                difficulty: dto.difficulty || null,
                options: dto.options,
                correctAnswer: dto.correctAnswer || null,
                explanation: dto.explanation || null,
                metadata: dto.metadata,
                tags: dto.tags || [],
                createdBy: requester.sub,
                status: QuestionStatus.ACTIVE,
                usageCount: 0,
            }));

            const result = await this.questionRepository.createMany(data);

            // Fetch created questions to return
            const createdQuestions = await this.questionRepository.findMany({
                skip: 0,
                take: result.count,
                where: { createdBy: requester.sub },
                orderBy: { createdAt: 'desc' },
            });

            this.logger.log(`${result.count} questions created by ${requester.sub}`);
            return {
                count: result.count,
                created: createdQuestions.slice(0, result.count).map((q) => this.toQuestionDto(q)),
            };
        } catch (error: any) {
            this.logger.error(`Error creating questions: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to create questions: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Update question
     */
    async update(requester: Requester, questionId: string, dto: QuestionUpdateDTO): Promise<QuestionResponseDTO> {
        this.checkPermission(requester, 'update');

        const existing = await this.questionRepository.findById(questionId);

        if (!existing) {
            throw new NotFoundException(`Question with id ${questionId} not found`);
        }

        // Validate if question type or related fields are being updated
        if (dto.questionType || dto.options || dto.correctAnswer) {
            const validationDto = {
                questionType: dto.questionType || existing.questionType,
                options: dto.options !== undefined ? dto.options : existing.options,
                correctAnswer: dto.correctAnswer !== undefined ? dto.correctAnswer : existing.correctAnswer,
            } as QuestionCreateDTO;
            this.validateQuestion(validationDto);
        }

        try {
            const updateData: any = {};

            if (dto.questionText !== undefined) updateData.questionText = dto.questionText;
            if (dto.questionType !== undefined) updateData.questionType = dto.questionType;
            if (dto.poolId !== undefined) updateData.poolId = dto.poolId;
            if (dto.jlptLevel !== undefined) updateData.jlptLevel = dto.jlptLevel;
            if (dto.category !== undefined) updateData.category = dto.category;
            if (dto.subcategory !== undefined) updateData.subcategory = dto.subcategory;
            if (dto.difficulty !== undefined) updateData.difficulty = dto.difficulty;
            if (dto.options !== undefined) updateData.options = dto.options;
            if (dto.correctAnswer !== undefined) updateData.correctAnswer = dto.correctAnswer;
            if (dto.explanation !== undefined) updateData.explanation = dto.explanation;
            if (dto.metadata !== undefined) updateData.metadata = dto.metadata;
            if (dto.tags !== undefined) updateData.tags = dto.tags;
            if (dto.status !== undefined) updateData.status = dto.status;

            if (Object.keys(updateData).length === 0) {
                return this.toQuestionDto(existing);
            }

            const question = await this.questionRepository.update(questionId, updateData);
            this.logger.log(`Question ${questionId} updated by ${requester.sub}`);

            return this.toQuestionDto(question);
        } catch (error: any) {
            this.logger.error(`Error updating question ${questionId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to update question: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Update multiple questions (bulk)
     */
    async updateMany(requester: Requester, questionIds: string[], dto: QuestionUpdateDTO): Promise<{ count: number }> {
        this.checkPermission(requester, 'update');

        if (!questionIds || questionIds.length === 0) {
            throw new BadRequestException('No question IDs provided');
        }

        if (questionIds.length > 100) {
            throw new BadRequestException('Cannot update more than 100 questions at once');
        }

        try {
            const updateData: any = {};

            if (dto.status !== undefined) updateData.status = dto.status;
            if (dto.category !== undefined) updateData.category = dto.category;
            if (dto.subcategory !== undefined) updateData.subcategory = dto.subcategory;
            if (dto.difficulty !== undefined) updateData.difficulty = dto.difficulty;
            if (dto.jlptLevel !== undefined) updateData.jlptLevel = dto.jlptLevel;
            if (dto.poolId !== undefined) updateData.poolId = dto.poolId;
            if (dto.tags !== undefined) updateData.tags = dto.tags;

            if (Object.keys(updateData).length === 0) {
                throw new BadRequestException('No update fields provided');
            }

            const result = await this.questionRepository.updateMany(
                { id: { in: questionIds } },
                updateData,
            );

            this.logger.log(`${result.count} questions updated by ${requester.sub}`);
            return { count: result.count };
        } catch (error: any) {
            this.logger.error(`Error updating questions: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to update questions: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Delete question
     */
    async delete(requester: Requester, questionId: string): Promise<{ message: string }> {
        this.checkPermission(requester, 'delete');

        const existing = await this.questionRepository.findById(questionId);

        if (!existing) {
            throw new NotFoundException(`Question with id ${questionId} not found`);
        }

        // Check if question is in use
        const inUse = await this.checkQuestionInUse(questionId);
        if (inUse) {
            throw new BadRequestException('Cannot delete question that is in use. Archive it instead.');
        }

        try {
            await this.questionRepository.delete(questionId);
            this.logger.log(`Question ${questionId} deleted by ${requester.sub}`);
            return { message: 'Question deleted successfully' };
        } catch (error: any) {
            this.logger.error(`Error deleting question ${questionId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to delete question: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Delete multiple questions (bulk)
     */
    async deleteMany(requester: Requester, questionIds: string[]): Promise<{ count: number }> {
        this.checkPermission(requester, 'delete');

        if (!questionIds || questionIds.length === 0) {
            throw new BadRequestException('No question IDs provided');
        }

        if (questionIds.length > 100) {
            throw new BadRequestException('Cannot delete more than 100 questions at once');
        }

        // Check if any questions are in use
        for (const questionId of questionIds) {
            const inUse = await this.checkQuestionInUse(questionId);
            if (inUse) {
                throw new BadRequestException(`Question ${questionId} is in use and cannot be deleted`);
            }
        }

        try {
            const result = await this.questionRepository.deleteMany({
                id: { in: questionIds },
            });

            this.logger.log(`${result.count} questions deleted by ${requester.sub}`);
            return { count: result.count };
        } catch (error: any) {
            this.logger.error(`Error deleting questions: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to delete questions: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Approve question (change status to active)
     */
    async approve(requester: Requester, questionId: string): Promise<QuestionResponseDTO> {
        this.checkPermission(requester, 'approve');

        const existing = await this.questionRepository.findById(questionId);

        if (!existing) {
            throw new NotFoundException(`Question with id ${questionId} not found`);
        }

        try {
            const question = await this.questionRepository.update(questionId, {
                status: QuestionStatus.ACTIVE,
            });

            this.logger.log(`Question ${questionId} approved by ${requester.sub}`);
            return this.toQuestionDto(question);
        } catch (error: any) {
            this.logger.error(`Error approving question ${questionId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to approve question: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Deactivate question (change status to inactive)
     */
    async deactivate(requester: Requester, questionId: string): Promise<QuestionResponseDTO> {
        this.checkPermission(requester, 'deactivate');

        const existing = await this.questionRepository.findById(questionId);

        if (!existing) {
            throw new NotFoundException(`Question with id ${questionId} not found`);
        }

        try {
            const question = await this.questionRepository.update(questionId, {
                status: QuestionStatus.INACTIVE,
            });

            this.logger.log(`Question ${questionId} deactivated by ${requester.sub}`);
            return this.toQuestionDto(question);
        } catch (error: any) {
            this.logger.error(`Error deactivating question ${questionId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to deactivate question: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Reject question (change status to archived)
     */
    async reject(requester: Requester, questionId: string): Promise<QuestionResponseDTO> {
        this.checkPermission(requester, 'reject');

        const existing = await this.questionRepository.findById(questionId);

        if (!existing) {
            throw new NotFoundException(`Question with id ${questionId} not found`);
        }

        try {
            const question = await this.questionRepository.update(questionId, {
                status: QuestionStatus.ARCHIVED,
            });

            this.logger.log(`Question ${questionId} rejected by ${requester.sub}`);
            return this.toQuestionDto(question);
        } catch (error: any) {
            this.logger.error(`Error rejecting question ${questionId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to reject question: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Send question for review (change status to review)
     */
    async sendForReview(requester: Requester, questionId: string): Promise<QuestionResponseDTO> {
        const existing = await this.questionRepository.findById(questionId);

        if (!existing) {
            throw new NotFoundException(`Question with id ${questionId} not found`);
        }

        try {
            const question = await this.questionRepository.update(questionId, {
                status: QuestionStatus.REVIEW,
            });

            this.logger.log(`Question ${questionId} sent for review by ${requester.sub}`);
            return this.toQuestionDto(question);
        } catch (error: any) {
            this.logger.error(`Error sending question for review ${questionId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to send question for review: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Get questions by category
     */
    async getByCategory(category: string): Promise<QuestionResponseDTO[]> {
        const questions = await this.questionRepository.findByCategory(category);
        return questions.map((q) => this.toQuestionDto(q));
    }

    /**
     * Get questions by JLPT level
     */
    async getByJlptLevel(jlptLevel: string): Promise<QuestionResponseDTO[]> {
        const questions = await this.questionRepository.findByJlptLevel(jlptLevel);
        return questions.map((q) => this.toQuestionDto(q));
    }

    /**
     * Get questions by status
     */
    async getByStatus(status: string): Promise<QuestionResponseDTO[]> {
        const questions = await this.questionRepository.findByStatus(status);
        return questions.map((q) => this.toQuestionDto(q));
    }

    /**
     * Get questions by pool
     */
    async getByPool(poolId: string): Promise<QuestionResponseDTO[]> {
        const questions = await this.questionRepository.findByPool(poolId);
        return questions.map((q) => this.toQuestionDto(q));
    }
}

