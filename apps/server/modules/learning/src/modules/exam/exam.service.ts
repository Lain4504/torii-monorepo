import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
    type ExamCreateDTO,
    type ExamUpdateDTO,
    type ExamQueryDTO,
    type ExamResponseDTO,
    type ExamSessionStartDTO,
    type ExamSessionStartResponseDTO,
    type ExamSessionAnswersDTO,
    type ExamSessionResponseDTO,
    type ExamSessionSubmitDTO,
    type ExamWithStatusResponseDTO,
    type ExamSessionQueryDTO,
    type ExamSessionWithExamResponseDTO,
    ExamStatus,
    ExamSessionStatus,
    ExamSectionType,
    type PaginatedResponseDTO,
} from '@workspace/schemas';

@Injectable()
export class ExamService {
    private readonly logger = new Logger(ExamService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Map Prisma Quiz to ExamResponseDTO (keeping DTO name for API compatibility)
     */
    private toExamDto(quiz: any): ExamResponseDTO {
        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description || undefined,
            jlptLevel: quiz.jlptLevel,
            examType: quiz.quizType, // Map quizType to examType for DTO compatibility
            sections: quiz.sections as any,
            totalTime: quiz.totalTime || 0, // totalTime is mapped to time_limit_minutes in schema
            totalQuestions: quiz.totalQuestions,
            status: quiz.status,
            createdBy: quiz.createdBy || undefined,
            createdAt: quiz.createdAt,
            updatedAt: quiz.updatedAt,
        };
    }

    /**
     * Map Prisma QuizAttempt to ExamSessionResponseDTO (keeping DTO name for API compatibility)
     */
    private toExamSessionDto(attempt: any): ExamSessionResponseDTO {
        return {
            id: attempt.id,
            examId: attempt.quizId, // Map quizId to examId for DTO compatibility
            userId: attempt.userId,
            status: attempt.status as ExamSessionStatus,
            startedAt: attempt.startedAt,
            submittedAt: attempt.submittedAt ?? undefined,
            timeRemaining: attempt.timeRemaining ?? undefined, // Use ?? to handle 0 correctly
            answers: attempt.answers as Record<string, string>,
            flaggedQuestions: attempt.flaggedQuestions ?? [],
            currentSection: attempt.currentSection ?? undefined,
            currentQuestion: attempt.currentQuestion ?? undefined,
            createdAt: attempt.createdAt,
            updatedAt: attempt.updatedAt,
        };
    }

    /**
     * Get all exams with user session status
     * GET /api/v1/exams (with userId to get session status)
     */
    async findAllWithStatus(query: ExamQueryDTO, userId?: string): Promise<PaginatedResponseDTO<ExamWithStatusResponseDTO>> {
        try {
            const {
                page = 1,
                limit = 10,
                jlptLevel,
                examType,
                status,
                search,
            } = query;

            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;

            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Record<string, any> = {};

            if (jlptLevel) {
                whereClause.jlptLevel = jlptLevel;
            }

            if (examType) {
                whereClause.quizType = examType; // Map examType query param to quizType field
            }

            if (status) {
                whereClause.status = status;
            }

            if (search) {
                whereClause.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }

            this.logger.log(`Fetching quizzes (exams) with filters: ${JSON.stringify(whereClause)}`);

            const [total, quizzes] = await Promise.all([
                this.prisma.quiz.count({ where: whereClause }),
                this.prisma.quiz.findMany({
                    take: validLimit,
                    skip: skip,
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            this.logger.log(`Found ${total} quizzes, returning ${quizzes.length} quizzes`);

            // Get user attempts for these quizzes if userId provided
            let userAttempts: any[] = [];
            if (userId) {
                const quizIds = quizzes.map(q => q.id);
                userAttempts = await this.prisma.quizAttempt.findMany({
                    where: {
                        userId,
                        quizId: { in: quizIds },
                    },
                    orderBy: { createdAt: 'desc' },
                });
            }

            // Map attempts by quizId
            const attemptsByQuizId = new Map();
            userAttempts.forEach(attempt => {
                const quizId = attempt.quizId;
                if (!attemptsByQuizId.has(quizId) ||
                    attempt.status === ExamSessionStatus.IN_PROGRESS ||
                    (attempt.createdAt > attemptsByQuizId.get(quizId).createdAt &&
                        attemptsByQuizId.get(quizId).status !== ExamSessionStatus.IN_PROGRESS)) {
                    attemptsByQuizId.set(quizId, attempt);
                }
            });

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: quizzes.map((q) => {
                    const attempt = attemptsByQuizId.get(q.id);
                    const examDto = this.toExamDto(q);

                    return {
                        ...examDto,
                        sessionStatus: attempt ? (attempt.status as ExamSessionStatus) : undefined,
                        sessionId: attempt?.id,
                        score: attempt?.status === ExamSessionStatus.SUBMITTED ? this.calculateScore(attempt) : undefined,
                        maxScore: q.totalQuestions,
                        progress: attempt ? this.calculateProgress(attempt, q.totalQuestions) : undefined,
                        lastAttemptDate: attempt?.submittedAt || attempt?.startedAt,
                    };
                }),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching exams with status: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Get all exams with filters
     */
    async findAll(query: ExamQueryDTO): Promise<PaginatedResponseDTO<ExamResponseDTO>> {
        try {
            const {
                page = 1,
                limit = 10,
                jlptLevel,
                examType,
                status,
                search,
            } = query;

            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;

            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Record<string, any> = {};

            if (jlptLevel) {
                whereClause.jlptLevel = jlptLevel;
            }

            if (examType) {
                whereClause.quizType = examType; // Map examType query param to quizType field
            }

            if (status) {
                whereClause.status = status;
            }

            if (search) {
                whereClause.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }

            const [total, quizzes] = await Promise.all([
                this.prisma.quiz.count({ where: whereClause }),
                this.prisma.quiz.findMany({
                    take: validLimit,
                    skip: skip,
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: quizzes.map((q) => this.toExamDto(q)),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching exams: ${error.message}`, error.stack);
            throw error;
        }
    }


    /**
     * Start an exam session
     * POST /api/v1/exams/:id/start
     */
    async startExam(examId: string, userId: string): Promise<ExamSessionStartResponseDTO> {
        try {
            // Find quiz (using examId parameter for API compatibility)
            const quiz = await this.prisma.quiz.findUnique({
                where: { id: examId },
            });

            if (!quiz) {
                throw new NotFoundException('Exam not found');
            }

            if (quiz.status !== ExamStatus.PUBLISHED) {
                throw new BadRequestException('Exam is not available');
            }

            // Check for existing in-progress attempt
            const existingAttempt = await this.prisma.quizAttempt.findFirst({
                where: {
                    quizId: examId, // Use examId (which is actually quizId)
                    userId,
                    status: ExamSessionStatus.IN_PROGRESS,
                },
            });

            if (existingAttempt) {
                // Return existing attempt
                return this.buildSessionStartResponse(existingAttempt, quiz);
            }

            // Generate questions for each section
            const questions = await this.generateExamQuestions(quiz);

            // Calculate total time in seconds
            const totalTimeMinutes = quiz.totalTime || 0; // totalTime is mapped to time_limit_minutes
            const totalTimeSeconds = totalTimeMinutes * 60;

            // Create new attempt
            const attempt = await this.prisma.quizAttempt.create({
                data: {
                    quizId: examId, // Use examId (which is actually quizId)
                    userId,
                    status: ExamSessionStatus.IN_PROGRESS,
                    startedAt: new Date(),
                    timeRemaining: totalTimeSeconds,
                    answers: {},
                    flaggedQuestions: [],
                    currentSection: (quiz.sections as any[])?.[0]?.type || null,
                    currentQuestion: 1,
                },
            });

            return this.buildSessionStartResponse(attempt, quiz, questions);
        } catch (error: any) {
            this.logger.error(`Error starting exam ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Save exam session answers
     * PUT /api/v1/exams/sessions/:sessionId/answers
     */
    async saveAnswers(sessionId: string, userId: string, data: ExamSessionAnswersDTO): Promise<ExamSessionResponseDTO> {
        try {
            const attempt = await this.prisma.quizAttempt.findUnique({
                where: { id: sessionId },
            });

            if (!attempt) {
                throw new NotFoundException('Exam session not found');
            }

            if (attempt.userId !== userId) {
                throw new BadRequestException('Unauthorized');
            }

            if (attempt.status !== ExamSessionStatus.IN_PROGRESS) {
                throw new BadRequestException('Session is not in progress');
            }

            const dataWithTime = data as ExamSessionAnswersDTO & { timeRemaining?: number };

            const updated = await this.prisma.quizAttempt.update({
                where: { id: sessionId },
                data: {
                    answers: data.answers,
                    flaggedQuestions: data.flaggedQuestions !== undefined ? data.flaggedQuestions : attempt.flaggedQuestions,
                    currentSection: data.currentSection !== undefined ? data.currentSection : attempt.currentSection,
                    currentQuestion: data.currentQuestion !== undefined ? data.currentQuestion : attempt.currentQuestion,
                    timeRemaining: dataWithTime.timeRemaining !== undefined ? dataWithTime.timeRemaining : attempt.timeRemaining,
                    updatedAt: new Date(),
                },
            });

            return this.toExamSessionDto(updated);
        } catch (error: any) {
            this.logger.error(`Error saving answers for session ${sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Submit exam session
     * POST /api/v1/exams/sessions/:sessionId/submit
     */
    async submitSession(sessionId: string, userId: string): Promise<ExamSessionResponseDTO> {
        try {
            const attempt = await this.prisma.quizAttempt.findUnique({
                where: { id: sessionId },
            });

            if (!attempt) {
                throw new NotFoundException('Exam session not found');
            }

            if (attempt.userId !== userId) {
                throw new BadRequestException('Unauthorized');
            }

            // Allow submit if status is IN_PROGRESS, or if already submitted return the existing attempt
            if (attempt.status === ExamSessionStatus.SUBMITTED || attempt.status === ExamSessionStatus.COMPLETED) {
                // Already submitted, return existing attempt
                this.logger.warn(`Attempt ${sessionId} already submitted, returning existing attempt`);
                return this.toExamSessionDto(attempt);
            }

            if (attempt.status !== ExamSessionStatus.IN_PROGRESS) {
                throw new BadRequestException(`Session is not in progress. Current status: ${attempt.status}`);
            }

            const updated = await this.prisma.quizAttempt.update({
                where: { id: sessionId },
                data: {
                    status: ExamSessionStatus.SUBMITTED,
                    submittedAt: new Date(),
                    completedAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            return this.toExamSessionDto(updated);
        } catch (error: any) {
            this.logger.error(`Error submitting session ${sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Generate questions for quiz based on sections
     */
    private async generateExamQuestions(quiz: any): Promise<any[]> {
        const sections = (quiz.sections as any[]) || [];
        const questions: any[] = [];

        for (const section of sections) {
            // Get questions from question bank based on section criteria
            const sectionQuestions = await this.prisma.questionBank.findMany({
                where: {
                    jlptLevel: quiz.jlptLevel,
                    category: section.type,
                    status: 'active',
                },
                take: section.questionCount,
            });

            // Map to exam question format (without correctAnswer for security)
            questions.push(...sectionQuestions.map((q, idx) => {
                const options = q.options as Record<string, any> | null;
                return {
                    id: q.id,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    options: q.options,
                    audioUrl: section.type === ExamSectionType.LISTENING ? options?.audioUrl : undefined,
                    section: section.type,
                    order: idx + 1,
                };
            }));
        }

        return questions;
    }

    /**
     * Build session start response
     */
    private async buildSessionStartResponse(
        attempt: any,
        quiz: any,
        questions?: any[]
    ): Promise<ExamSessionStartResponseDTO> {
        if (!questions) {
            questions = await this.generateExamQuestions(quiz);
        }

        // Calculate actual time remaining based on elapsed time
        // This ensures time continues even when user is away
        const totalTimeMinutes = quiz.totalTime || 0; // totalTime is mapped to time_limit_minutes in schema
        const totalTimeSeconds = totalTimeMinutes * 60;
        let calculatedTimeRemaining = totalTimeSeconds;

        if (attempt.startedAt) {
            const startedAt = new Date(attempt.startedAt);
            const now = new Date();
            const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
            calculatedTimeRemaining = Math.max(0, totalTimeSeconds - elapsedSeconds);

            // Update timeRemaining in database if it's different (more than 5 seconds difference)
            // This syncs the stored value with actual elapsed time
            const storedTimeRemaining = attempt.timeRemaining ?? totalTimeSeconds; // Use ?? to handle 0 correctly
            if (Math.abs(calculatedTimeRemaining - storedTimeRemaining) > 5) {
                // Update in background (don't await to avoid blocking response)
                this.prisma.quizAttempt.update({
                    where: { id: attempt.id },
                    data: { timeRemaining: calculatedTimeRemaining },
                }).catch(err => {
                    this.logger.warn(`Failed to update timeRemaining for attempt ${attempt.id}: ${err.message}`);
                });
            }
        }

        return {
            sessionId: attempt.id,
            exam: this.toExamDto(quiz),
            questions,
            timeLimit: totalTimeSeconds,
            sections: quiz.sections as any,
            // Include attempt data for resume
            answers: (attempt.answers as Record<string, string>) ?? {},
            flaggedQuestions: attempt.flaggedQuestions ?? [],
            currentQuestion: attempt.currentQuestion ?? 1,
            timeRemaining: calculatedTimeRemaining,
        } as ExamSessionStartResponseDTO;
    }

    /**
     * Get user's exam sessions (history)
     * GET /api/v1/exams/sessions
     */
    async getUserSessions(userId: string, query: ExamSessionQueryDTO): Promise<PaginatedResponseDTO<ExamSessionWithExamResponseDTO>> {
        try {
            const {
                page = 1,
                limit = 10,
                status,
                examId,
            } = query;

            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;

            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Record<string, any> = {
                userId,
            };

            if (status) {
                whereClause.status = status;
            }

            // Note: examId query param will be mapped to quizId in the query below

            // Map examId query param to quizId field
            if (examId) {
                whereClause.quizId = examId;
                delete whereClause.examId;
            }

            const [total, attempts] = await Promise.all([
                this.prisma.quizAttempt.count({ where: whereClause }),
                this.prisma.quizAttempt.findMany({
                    take: validLimit,
                    skip: skip,
                    where: whereClause,
                    include: {
                        quiz: true,
                    },
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: attempts.map((a) => {
                    const sessionDto = this.toExamSessionDto(a);
                    const exam = a.quiz ? this.toExamDto(a.quiz) : undefined;
                    const score = a.status === ExamSessionStatus.SUBMITTED ? this.calculateScore(a) : undefined;
                    const maxScore = exam?.totalQuestions || 0;

                    return {
                        ...sessionDto,
                        exam,
                        score,
                        maxScore,
                        passed: score !== undefined && maxScore > 0 ? score >= (maxScore * 0.6) : undefined,
                    };
                }),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching user sessions: ${error.message}`, error.stack);
            throw error;
        }
    }



    /**
     * Calculate score from session (placeholder - actual grading in story 6.3)
     */
    private calculateScore(session: any): number {
        // TODO: Implement actual grading logic in story 6.3
        // For now, return a placeholder based on answers count
        const answers = session.answers as Record<string, string> || {};
        return Object.keys(answers).length;
    }

    /**
     * Calculate progress percentage
     */
    private calculateProgress(session: any, totalQuestions: number): number {
        if (totalQuestions === 0) return 0;
        const answers = session.answers as Record<string, string> || {};
        const answeredCount = Object.keys(answers).length;
        return Math.round((answeredCount / totalQuestions) * 100);
    }
}


