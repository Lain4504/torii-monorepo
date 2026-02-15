import {
    Injectable,
    Logger,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import type { QuestionPool } from '@prisma/generated';

import type {
    QuestionPoolCreateDTO,
    QuestionPoolUpdateDTO,
    QuestionPoolQueryDTO,
    QuestionPoolResponseDTO,
    PaginatedResponseDTO,
    Requester,
} from '@workspace/schemas';
import type { IQuestionPoolService } from '@server/learning/interfaces/services/i-question-pool.service';
import type { IQuestionPoolRepository } from '@server/learning/interfaces/repositories/i-question-pool.repository';
import { QUESTION_POOL_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-question-pool.repository';

/**
 * Question Pool Service
 * Handles question pool business logic operations
 */
@Injectable()
export class QuestionPoolService implements IQuestionPoolService {
    private readonly logger = new Logger(QuestionPoolService.name);

    constructor(
        @Inject(QUESTION_POOL_REPOSITORY_TOKEN)
        private readonly questionPoolRepository: IQuestionPoolRepository,
    ) { }

    /**
     * Map QuestionPool entity to QuestionPoolResponseDTO
     */
    private toQuestionPoolDto(pool: QuestionPool): QuestionPoolResponseDTO {
        return {
            id: pool.id,
            name: pool.name,
            description: pool.description || undefined,
            courseId: pool.courseId || undefined,
            lessonId: pool.lessonId || undefined,
            jlptLevel: pool.jlptLevel as any,
            createdBy: pool.createdBy || undefined,
            createdAt: pool.createdAt,
            updatedAt: pool.updatedAt,
        };
    }

    /**
     * Check if user has permission to manage pools
     */
    private checkPermission(requester: Requester, action: string): void {
        const hasPermission = requester.permissions?.includes('*') || requester.permissions?.includes('exam.manage');
        if (!hasPermission) {
            throw new ForbiddenException(`Only authorized staff can ${action} question pools`);
        }
    }

    /**
     * Find all pools with pagination and filters
     */
    async findAll(query: QuestionPoolQueryDTO): Promise<PaginatedResponseDTO<QuestionPoolResponseDTO>> {
        try {
            const {
                page = 1,
                limit = 10,
                courseId,
                lessonId,
                jlptLevel,
                search,
            } = query;

            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;

            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 10;

            const skip = (validPage - 1) * validLimit;

            const whereClause: any = {};

            if (courseId) {
                whereClause.courseId = courseId;
            }

            if (lessonId) {
                whereClause.lessonId = lessonId;
            }

            if (jlptLevel) {
                whereClause.jlptLevel = jlptLevel;
            }

            if (search) {
                whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }

            const [total, pools] = await Promise.all([
                this.questionPoolRepository.count(whereClause),
                this.questionPoolRepository.findMany({
                    skip,
                    take: validLimit,
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: pools.map((p) => this.toQuestionPoolDto(p)),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching pools: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to fetch pools: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Find one pool by ID
     */
    async findOne(poolId: string): Promise<QuestionPoolResponseDTO> {
        const pool = await this.questionPoolRepository.findById(poolId);

        if (!pool) {
            throw new NotFoundException(`Question pool with id ${poolId} not found`);
        }

        return this.toQuestionPoolDto(pool);
    }

    /**
     * Create a new pool
     */
    async create(requester: Requester, dto: QuestionPoolCreateDTO): Promise<QuestionPoolResponseDTO> {
        this.checkPermission(requester, 'create');

        try {
            const pool = await this.questionPoolRepository.create({
                name: dto.name,
                description: dto.description || null,
                courseId: dto.courseId || null,
                lessonId: dto.lessonId || null,
                jlptLevel: dto.jlptLevel || null,
                createdBy: requester.sub,
            });

            this.logger.log(`Question pool ${pool.id} created by ${requester.sub}`);
            return this.toQuestionPoolDto(pool);
        } catch (error: any) {
            this.logger.error(`Error creating pool: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to create pool: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Update pool
     */
    async update(requester: Requester, poolId: string, dto: QuestionPoolUpdateDTO): Promise<QuestionPoolResponseDTO> {
        this.checkPermission(requester, 'update');

        const existing = await this.questionPoolRepository.findById(poolId);

        if (!existing) {
            throw new NotFoundException(`Question pool with id ${poolId} not found`);
        }

        try {
            const updateData: any = {};

            if (dto.name !== undefined) updateData.name = dto.name;
            if (dto.description !== undefined) updateData.description = dto.description;
            if (dto.courseId !== undefined) updateData.courseId = dto.courseId;
            if (dto.lessonId !== undefined) updateData.lessonId = dto.lessonId;
            if (dto.jlptLevel !== undefined) updateData.jlptLevel = dto.jlptLevel;

            if (Object.keys(updateData).length === 0) {
                return this.toQuestionPoolDto(existing);
            }

            const pool = await this.questionPoolRepository.update(poolId, updateData);
            this.logger.log(`Question pool ${poolId} updated by ${requester.sub}`);

            return this.toQuestionPoolDto(pool);
        } catch (error: any) {
            this.logger.error(`Error updating pool ${poolId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to update pool: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Delete pool
     */
    async delete(requester: Requester, poolId: string): Promise<{ message: string }> {
        this.checkPermission(requester, 'delete');

        const existing = await this.questionPoolRepository.findById(poolId);

        if (!existing) {
            throw new NotFoundException(`Question pool with id ${poolId} not found`);
        }

        try {
            await this.questionPoolRepository.delete(poolId);
            this.logger.log(`Question pool ${poolId} deleted by ${requester.sub}`);
            return { message: 'Question pool deleted successfully' };
        } catch (error: any) {
            this.logger.error(`Error deleting pool ${poolId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to delete pool: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Get pools by course
     */
    async getByCourse(courseId: string): Promise<QuestionPoolResponseDTO[]> {
        const pools = await this.questionPoolRepository.findByCourse(courseId);
        return pools.map((p) => this.toQuestionPoolDto(p));
    }

    /**
     * Get pools by lesson
     */
    async getByLesson(lessonId: string): Promise<QuestionPoolResponseDTO[]> {
        const pools = await this.questionPoolRepository.findByLesson(lessonId);
        return pools.map((p) => this.toQuestionPoolDto(p));
    }

    /**
     * Get pools by JLPT level
     */
    async getByJlptLevel(jlptLevel: string): Promise<QuestionPoolResponseDTO[]> {
        const pools = await this.questionPoolRepository.findByJlptLevel(jlptLevel);
        return pools.map((p) => this.toQuestionPoolDto(p));
    }
}


