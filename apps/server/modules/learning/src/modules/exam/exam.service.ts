import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { ClientProxy } from '@nestjs/microservices';
import {
    type ExamCreateDTO,
    type ExamUpdateDTO,
    type ExamQueryDTO,
    type ExamResponseDTO,
    type ExamSessionStartResponseDTO,
    type ExamSessionAnswersDTO,
    type ExamSessionResponseDTO,
    type ExamWithStatusResponseDTO,
    type ExamSessionQueryDTO,
    type ExamSessionWithExamResponseDTO,
    ExamStatus,
    ExamSessionStatus,
    ExamSectionType,
    type PaginatedResponseDTO,
    type Requester,
    UserActivityEvent,
} from '@workspace/schemas';
import type { IExamRepository } from '@server/learning/interfaces/repositories/i-exam.repository';
import { EXAM_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-exam.repository';
import type { IExamService } from '@server/learning/interfaces/services/i-exam.service';
import { PrismaService } from '@server/shared';

@Injectable()
export class ExamService implements IExamService {
    private readonly logger = new Logger(ExamService.name);

    constructor(
        @Inject(EXAM_REPOSITORY_TOKEN)
        private readonly examRepository: IExamRepository,
        private readonly prisma: PrismaService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    /**
     * Get all exams with user session status
     * GET /api/v1/exams (with userId to get session status)
     */
    async findAllWithStatus(userId: string, query: ExamQueryDTO): Promise<PaginatedResponseDTO<ExamWithStatusResponseDTO>> {
        try {
            const {
                page = 1,
                limit = 10,
                jlptLevel,
                examType,
                status,
                courseRunId,
                search,
            } = query as any;

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

            // Filter by lessonId if provided (for lesson-linked quizzes)
            if ((query as any).lessonId) {
                whereClause.lessonId = (query as any).lessonId;
            }

            // Filter by courseRunId if provided
            if (courseRunId) {
                whereClause.courseRunId = courseRunId;
            }

            this.logger.log(`Fetching quizzes (exams) with filters: ${JSON.stringify(whereClause)}`);

            const [total, quizzes] = await Promise.all([
                this.examRepository.count(whereClause),
                this.examRepository.findMany({
                    skip,
                    take: validLimit,
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            this.logger.log(`Found ${total} quizzes, returning ${quizzes.length} quizzes`);

            // Get user attempts for these quizzes if userId provided
            let userAttempts: any[] = [];
            if (userId) {
                const quizIds = quizzes.map(q => q.id);
                userAttempts = await this.examRepository.findAttempts({
                    skip: 0,
                    take: 10000, // Get all attempts for these quizzes
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
                    const examDto = this.mapper.map<any, ExamResponseDTO>(q, 'Quiz', 'ExamResponseDTO');

                    return {
                        ...examDto,
                        sessionStatus: attempt ? (attempt.status as ExamSessionStatus) : undefined,
                        sessionId: attempt?.id,
                        courseRunId: q.courseRunId ?? undefined,
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
     * GET /api/admin/exams
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
                courseRunId,
                courseMasterId,
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

            if (courseRunId) {
                whereClause.courseRunId = courseRunId;
            }

            if (courseMasterId) {
                whereClause.AND = whereClause.AND || [];
                whereClause.AND.push({
                    OR: [
                        { lesson: { module: { courseMasterId } } },
                        { courseRun: { courseMasterId } },
                    ],
                });
            }

            if (search) {
                whereClause.AND = whereClause.AND || [];
                whereClause.AND.push({
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                });
            }

            const [total, quizzes] = await Promise.all([
                this.examRepository.count(whereClause),
                this.examRepository.findMany({
                    skip,
                    take: validLimit,
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: quizzes.map((q) => this.mapper.map<any, ExamResponseDTO>(q, 'Quiz', 'ExamResponseDTO')),
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
     * POST /api/exams/:id/start
     */
    async startExam(examId: string, userId: string, courseRunId: string): Promise<ExamSessionStartResponseDTO> {
        try {
            // Find quiz (using examId parameter for API compatibility)
            const quiz = await this.examRepository.findById(examId);

            if (!quiz) {
                throw new NotFoundException('Exam not found');
            }

            if (quiz.status !== ExamStatus.PUBLISHED) {
                throw new BadRequestException('Exam is not available');
            }

            // Check for existing in-progress attempt
            const existingAttempts = await this.examRepository.findAttempts({
                skip: 0,
                take: 1,
                where: {
                    quizId: examId,
                    userId,
                    courseRunId,
                    status: ExamSessionStatus.IN_PROGRESS,
                },
            });
            const existingAttempt = existingAttempts[0] || null;

            if (existingAttempt) {
                // Return existing attempt
                return this.buildSessionStartResponse(existingAttempt, quiz);
            }

            // Check max attempts
            const existingAttemptsCount = await this.examRepository.countAttempts({
                quizId: examId,
                userId,
                courseRunId,
                status: { in: [ExamSessionStatus.SUBMITTED, ExamSessionStatus.COMPLETED] },
            });

            if (quiz.maxAttempts > 0 && existingAttemptsCount >= quiz.maxAttempts) {
                throw new BadRequestException(
                    `Maximum attempts (${quiz.maxAttempts}) reached for this exam`
                );
            }

            // Calculate attempt number
            const attemptNumber = existingAttemptsCount + 1;

            // Generate questions for each section
            const questions = await this.generateExamQuestions(quiz);

            // Calculate total time in seconds
            const totalTimeMinutes = quiz.totalTime || 0; // totalTime is mapped to time_limit_minutes
            const totalTimeSeconds = totalTimeMinutes * 60;

            // Create new attempt
            const attempt = await this.examRepository.createAttempt({
                quiz: { connect: { id: examId } },
                courseRun: { connect: { id: courseRunId } },
                userId,
                status: ExamSessionStatus.IN_PROGRESS,
                startedAt: new Date(),
                timeRemaining: totalTimeSeconds,
                answers: {},
                flaggedQuestions: [],
                currentSection: (quiz.sections as any[])?.[0]?.type || null,
                currentQuestion: 1,
                attemptNumber: attemptNumber,
                courseRunId,
            } as any);

            return this.buildSessionStartResponse(attempt, quiz, questions);
        } catch (error: any) {
            this.logger.error(`Error starting exam ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Save exam session answers
     * PUT /api/exams/sessions/:sessionId/answers
     */
    async saveAnswers(sessionId: string, userId: string, data: ExamSessionAnswersDTO): Promise<ExamSessionResponseDTO> {
        try {
            const attempt = await this.examRepository.findAttemptById(sessionId, {
                quiz: true,
            }) as any;

            if (!attempt) {
                throw new NotFoundException('Exam session not found');
            }

            if (attempt.userId !== userId) {
                throw new BadRequestException('Unauthorized');
            }

            if (attempt.status !== ExamSessionStatus.IN_PROGRESS) {
                // If the session is already submitted or completed, just ignore the save request instead of throwing error
                // This prevents race conditions between auto-save and submission
                this.logger.warn(`Attempt ${sessionId} is already ${attempt.status}, ignoring save request`);
                return this.mapper.map<any, ExamSessionResponseDTO>(attempt, 'QuizAttempt', 'ExamSessionResponseDTO');
            }

            // Get quiz separately if not included
            const quiz = attempt.quiz || await this.examRepository.findById(attempt.quizId);

            // Check time limit
            const dataWithTime = data as ExamSessionAnswersDTO & { timeRemaining?: number };
            let timeRemaining = dataWithTime.timeRemaining !== undefined ? dataWithTime.timeRemaining : attempt.timeRemaining;

            // Calculate actual time remaining based on elapsed time
            if (attempt.startedAt && quiz?.totalTime) {
                const startedAt = new Date(attempt.startedAt);
                const now = new Date();
                const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
                const totalTimeSeconds = (quiz.totalTime || 0) * 60;
                const calculatedTimeRemaining = Math.max(0, totalTimeSeconds - elapsedSeconds);

                // Use the more accurate calculated time
                timeRemaining = calculatedTimeRemaining;
            }

            // Enforce time limit: if time is up, auto-submit
            if (timeRemaining !== null && timeRemaining <= 0) {
                this.logger.warn(`Attempt ${sessionId} time expired, auto-submitting`);
                return await this.submitSession(sessionId, userId);
            }

            const updated = await this.examRepository.updateAttempt(sessionId, {
                answers: data.answers,
                flaggedQuestions: data.flaggedQuestions !== undefined ? data.flaggedQuestions : attempt.flaggedQuestions,
                currentSection: data.currentSection !== undefined ? data.currentSection : attempt.currentSection,
                currentQuestion: data.currentQuestion !== undefined ? data.currentQuestion : attempt.currentQuestion,
                timeRemaining: timeRemaining,
            });

            return this.mapper.map<any, ExamSessionResponseDTO>(updated, 'QuizAttempt', 'ExamSessionResponseDTO');
        } catch (error: any) {
            this.logger.error(`Error saving answers for session ${sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Submit exam session
     * POST /api/exams/sessions/:sessionId/submit
     */
    async submitSession(sessionId: string, userId: string): Promise<ExamSessionResponseDTO> {
        try {
            const attempt = await this.examRepository.findAttemptById(sessionId, {
                quiz: true,
            }) as any;

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
                return this.mapper.map<any, ExamSessionResponseDTO>(attempt, 'QuizAttempt', 'ExamSessionResponseDTO');
            }

            if (attempt.status !== ExamSessionStatus.IN_PROGRESS) {
                throw new BadRequestException(`Session is not in progress. Current status: ${attempt.status}`);
            }

            // Get quiz separately if not included
            const quiz = attempt.quiz || await this.examRepository.findById(attempt.quizId);

            // Perform grading
            const gradingResult = await this.gradeAttempt({ ...attempt, quiz });

            // Calculate time taken
            const startedAt = new Date(attempt.startedAt);
            const submittedAt = new Date();
            const timeTakenSeconds = Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000);

            // Calculate percentage and isPassed
            const percentage = gradingResult.maxScore > 0
                ? (Number(gradingResult.score) / Number(gradingResult.maxScore)) * 100
                : 0;
            const isPassed = quiz?.passingScore
                ? percentage >= Number(quiz.passingScore)
                : percentage >= 60; // Default to 60% if not set

            // Update attempt with grading results
            const updated = await this.examRepository.updateAttempt(sessionId, {
                status: ExamSessionStatus.SUBMITTED,
                submittedAt: submittedAt,
                completedAt: submittedAt,
                score: gradingResult.score,
                maxScore: gradingResult.maxScore,
                percentage: percentage,
                isPassed: isPassed,
                timeTakenSeconds: timeTakenSeconds,
            });

            this.logger.log(
                `Attempt ${sessionId} graded: ${gradingResult.score}/${gradingResult.maxScore} (${percentage.toFixed(2)}%)`
            );

            // Emit activity event for XP gain
            try {
                const activityEvent: UserActivityEvent = {
                    userId,
                    activityType: 'EXAM_COMPLETE',
                    meta: {
                        examId: attempt.quizId,
                        sessionId: sessionId,
                        score: gradingResult.score,
                        maxScore: gradingResult.maxScore,
                        percentage: percentage,
                        isPassed: isPassed,
                    },
                    timestamp: new Date().toISOString(),
                };
                this.natsClient.emit('user.activity', activityEvent);
                this.logger.log(`Emitted EXAM_COMPLETE event for user ${userId}`);
            } catch (e) {
                this.logger.error('Failed to emit exam activity event', e);
            }

            return this.mapper.map<any, ExamSessionResponseDTO>(updated, 'QuizAttempt', 'ExamSessionResponseDTO');
        } catch (error: any) {
            this.logger.error(`Error submitting session ${sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Grade an attempt - calculate scores and create attempt details
     */
    private async gradeAttempt(attempt: any): Promise<{ score: number; maxScore: number }> {
        const answers = (attempt.answers as Record<string, string>) || {};
        const questionIds = Object.keys(answers);

        if (questionIds.length === 0) {
            this.logger.warn(`Attempt ${attempt.id} has no answers`);
            return { score: 0, maxScore: 0 };
        }

        // Get all questions for this attempt
        const questions = await this.examRepository.findQuestionsByIds(questionIds);

        // Get quiz questions to get points (if exists)
        const quizQuestions = await this.examRepository.findQuizQuestions(attempt.quizId);

        // Create a map of questionId -> points
        const pointsMap = new Map<string, number>();
        quizQuestions.forEach((qq) => {
            pointsMap.set(qq.questionId, Number(qq.points));
        });

        // Create a map of questionId -> question
        const questionMap = new Map<string, any>();
        questions.forEach((q) => {
            questionMap.set(q.id, q);
        });

        let totalScore = 0;
        let totalMaxScore = 0;
        const attemptDetails: any[] = [];

        // Grade each answer
        for (const questionId of questionIds) {
            const question = questionMap.get(questionId);
            if (!question) {
                this.logger.warn(`Question ${questionId} not found for attempt ${attempt.id}`);
                continue;
            }

            const userAnswer = answers[questionId];
            const correctAnswer = question.correctAnswer;
            const points = pointsMap.get(questionId) || 1.0; // Default 1 point if not in quizQuestions
            totalMaxScore += points;

            // Compare answers based on question type
            const isCorrect = this.compareAnswers(userAnswer, correctAnswer, question.questionType);
            const pointsEarned = isCorrect ? points : 0;
            totalScore += pointsEarned;

            // Create attempt detail
            attemptDetails.push({
                attemptId: attempt.id,
                questionId: questionId,
                userAnswer: userAnswer || null,
                isCorrect: isCorrect,
                pointsEarned: pointsEarned,
                timeSpentSeconds: null, // TODO: Track time per question if needed
            });

            // Update question usage count
            await this.examRepository.incrementQuestionUsageCount(questionId);
        }

        // Create all attempt details in batch
        if (attemptDetails.length > 0) {
            await this.examRepository.createAttemptDetails(attemptDetails);
        }

        return {
            score: totalScore,
            maxScore: totalMaxScore,
        };
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Compare user answer with correct answer based on question type
     */
    private compareAnswers(userAnswer: string | null, correctAnswer: string | null, questionType: string): boolean {
        if (!userAnswer || !correctAnswer) {
            return false;
        }

        // Normalize answers (trim and lowercase for comparison)
        const normalizedUser = userAnswer.trim().toLowerCase();
        const normalizedCorrect = correctAnswer.trim().toLowerCase();

        switch (questionType) {
            case 'multiple_choice':
            case 'true_false':
                // Exact match (case-insensitive)
                return normalizedUser === normalizedCorrect;

            case 'fill_blank':
                // For fill-in-the-blank, allow flexible matching
                // Remove extra spaces and compare
                return normalizedUser.replace(/\s+/g, ' ') === normalizedCorrect.replace(/\s+/g, ' ');

            case 'matching':
                // For matching questions, compare as-is (usually JSON or comma-separated)
                return normalizedUser === normalizedCorrect;

            case 'essay':
                // Essay questions typically require manual grading
                // For now, return false (can be updated later for auto-grading)
                return false;

            default:
                // Default: case-insensitive exact match
                return normalizedUser === normalizedCorrect;
        }
    }

    /**
     * Generate questions for quiz based on sections
     * Each section must have either questionIds (specific questions) or poolId (select from pool)
     */
    private async generateExamQuestions(quiz: any): Promise<any[]> {
        const sections = (quiz.sections as any[]) || [];
        let questions: any[] = [];

        for (const section of sections) {
            let sectionQuestions: any[] = [];

            // Option 1: Use specific questionIds if provided
            if (section.questionIds && section.questionIds.length > 0) {
                const allQuestions = await this.examRepository.findQuestionsByIds(section.questionIds);
                sectionQuestions = allQuestions.slice(0, section.questionCount);

                if (sectionQuestions.length < section.questionCount) {
                    this.logger.warn(
                        `Section ${section.type}: Requested ${section.questionCount} questions but only found ${sectionQuestions.length} from questionIds`
                    );
                }
            }
            // Option 2: Use poolId to select questions from pool
            else if (section.poolId) {
                sectionQuestions = await this.examRepository.findQuestionsByPool(section.poolId, section.questionCount);

                if (sectionQuestions.length < section.questionCount) {
                    this.logger.warn(
                        `Section ${section.type}: Requested ${section.questionCount} questions but pool ${section.poolId} only has ${sectionQuestions.length} active questions`
                    );
                }
            }
            // Error: Section must have either questionIds or poolId
            else {
                throw new BadRequestException(
                    `Section "${section.type}" must have either questionIds or poolId to generate questions`
                );
            }

            // Map to exam question format (without correctAnswer for security)
            const sectionQuestionList = sectionQuestions.map((q, idx) => {
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
            });

            questions.push(...sectionQuestionList);
        }

        // Shuffle questions if enabled (maintain section order but shuffle within sections)
        // Note: Shuffling is done after all sections are processed to maintain section grouping
        if (quiz.shuffleQuestions) {
            // Group questions by section
            const questionsBySection = new Map<string, any[]>();
            questions.forEach((q) => {
                if (!questionsBySection.has(q.section)) {
                    questionsBySection.set(q.section, []);
                }
                questionsBySection.get(q.section)!.push(q);
            });

            // Shuffle within each section and update order
            questions = [];
            let globalOrder = 1;
            questionsBySection.forEach((sectionQuestions, sectionType) => {
                // Shuffle the array
                const shuffled = this.shuffleArray([...sectionQuestions]);
                // Update order numbers
                shuffled.forEach((q) => {
                    q.order = globalOrder++;
                });
                questions.push(...shuffled);
            });
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
                this.examRepository.updateAttempt(attempt.id, {
                    timeRemaining: calculatedTimeRemaining,
                }).catch(err => {
                    this.logger.warn(`Failed to update timeRemaining for attempt ${attempt.id}: ${err.message}`);
                });
            }
        }

        return {
            sessionId: attempt.id,
            exam: this.mapper.map<any, ExamResponseDTO>(quiz, 'Quiz', 'ExamResponseDTO'),
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
     * GET /api/exams/attempts
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
                this.examRepository.countAttempts(whereClause),
                this.examRepository.findAttempts({
                    skip,
                    take: validLimit,
                    where: whereClause,
                    include: {
                        quiz: true,
                    },
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: attempts.map((a: any) => {
                    const sessionDto = this.mapper.map<any, ExamSessionResponseDTO>(a, 'QuizAttempt', 'ExamSessionResponseDTO');
                    const exam = a.quiz ? this.mapper.map<any, ExamResponseDTO>(a.quiz, 'Quiz', 'ExamResponseDTO') : undefined;
                    const score = a.status === ExamSessionStatus.SUBMITTED || a.status === ExamSessionStatus.COMPLETED
                        ? (a.score ? Number(a.score) : undefined)
                        : undefined;
                    const maxScore = a.maxScore ? Number(a.maxScore) : (exam?.totalQuestions || 0);

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
     * Calculate score from session
     * Note: This is used for display purposes only. Actual grading happens in submitSession()
     */
    private calculateScore(session: any): number {
        // If score is already calculated and stored, use it
        if (session.score !== null && session.score !== undefined) {
            return Number(session.score);
        }

        // Fallback: count answered questions (for in-progress sessions)
        const answers = (session.answers as Record<string, string>) || {};
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

    /**
     * Resolve related course master IDs for a given quiz
     */
    private async getCourseMasterIdsForQuiz(quiz: any): Promise<string[]> {
        const courseMasterIds = new Set<string>();

        // From linked lesson -> module -> course master
        if (quiz.lessonId) {
            const lesson = await this.prisma.lesson.findUnique({
                where: { id: quiz.lessonId },
                include: { module: true },
            });
            if (lesson?.module?.courseMasterId) {
                courseMasterIds.add(lesson.module.courseMasterId);
            }
        }

        // From linked course run -> course master
        if (quiz.courseRunId) {
            const run = await this.prisma.courseRun.findUnique({
                where: { id: quiz.courseRunId },
                select: { courseMasterId: true },
            });
            if (run?.courseMasterId) {
                courseMasterIds.add(run.courseMasterId);
            }
        }

        return Array.from(courseMasterIds);
    }

    /**
     * Check if user has permission to manage exams
     */
    private checkPermission(requester: Requester, action: string): void {
        const hasPermission = requester.permissions?.includes('*') || requester.permissions?.includes('exam.manage');
        if (!hasPermission) {
            throw new ForbiddenException(`Only authorized staff can ${action} exams`);
        }
    }

    /**
     * Calculate total questions from sections
     */
    private calculateTotalQuestions(sections: any[]): number {
        return sections.reduce((total, section) => total + (section.questionCount || 0), 0);
    }

    /**
     * Create a new exam/quiz (Staff only)
     * POST /api/v1/admin/exams
     */
    async create(requester: Requester, dto: ExamCreateDTO): Promise<ExamResponseDTO> {
        this.checkPermission(requester, 'create');

        try {
            // Validate sections
            if (!dto.sections || dto.sections.length === 0) {
                throw new BadRequestException('Exam must have at least one section');
            }

            // Calculate total questions
            const totalQuestions = this.calculateTotalQuestions(dto.sections);

            // Create quiz
            const quiz = await this.examRepository.create({
                title: dto.title,
                description: dto.description || null,
                quizType: dto.examType, // Map examType to quizType
                jlptLevel: dto.jlptLevel || null,
                sections: dto.sections as any,
                totalTime: dto.totalTime || null,
                totalQuestions: totalQuestions,
                passingScore: null, // Can be set later
                maxAttempts: 1, // Default
                shuffleQuestions: true, // Default
                showExplanation: false, // Default
                status: ExamStatus.DRAFT,
                createdBy: requester.sub,
                courseRunId: (dto as any).courseRunId,
            } as any);

            this.logger.log(`Exam ${quiz.id} created by ${requester.sub}`);

            // Trigger stats recalculation for associated course via NATS
            const createdCourseIds = await this.getCourseMasterIdsForQuiz(quiz);
            for (const courseMasterId of createdCourseIds) {
                this.natsClient.emit({ cmd: 'learning.courseMaster.recalculate_stats' }, { courseMasterId });
            }

            return this.mapper.map<any, ExamResponseDTO>(quiz, 'Quiz', 'ExamResponseDTO');
        } catch (error: any) {
            this.logger.error(`Error creating exam: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Update an exam/quiz (Staff only)
     * PUT /api/v1/admin/exams/:id
     */
    async update(requester: Requester, examId: string, dto: ExamUpdateDTO): Promise<ExamResponseDTO> {
        this.checkPermission(requester, 'update');

        try {
            const existingQuiz = await this.examRepository.findById(examId);

            if (!existingQuiz) {
                throw new NotFoundException('Exam not found');
            }

            // Prepare update data
            const updateData: any = {};

            if (dto.title !== undefined) updateData.title = dto.title;
            if (dto.description !== undefined) updateData.description = dto.description;
            if (dto.jlptLevel !== undefined) updateData.jlptLevel = dto.jlptLevel;
            if (dto.examType !== undefined) updateData.quizType = dto.examType;
            if (dto.totalTime !== undefined) updateData.totalTime = dto.totalTime;
            if (dto.status !== undefined) updateData.status = dto.status;
            if ((dto as any).courseRunId !== undefined) updateData.courseRunId = (dto as any).courseRunId;

            // Update sections if provided
            if (dto.sections !== undefined) {
                updateData.sections = dto.sections as any;
                updateData.totalQuestions = this.calculateTotalQuestions(dto.sections);
            }

            const updated = await this.examRepository.update(examId, updateData);

            this.logger.log(`Exam ${examId} updated by ${requester.sub}`);

            // Recalculate stats for both OLD and NEW associations via NATS
            const affectedCourses = new Set<string>();
            const oldIds = await this.getCourseMasterIdsForQuiz(existingQuiz);
            const newIds = await this.getCourseMasterIdsForQuiz(updated);

            oldIds.forEach(id => affectedCourses.add(id));
            newIds.forEach(id => affectedCourses.add(id));

            for (const courseMasterId of affectedCourses) {
                this.natsClient.emit({ cmd: 'learning.courseMaster.recalculate_stats' }, { courseMasterId });
            }

            return this.mapper.map<any, ExamResponseDTO>(updated, 'Quiz', 'ExamResponseDTO');
        } catch (error: any) {
            this.logger.error(`Error updating exam ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Delete an exam/quiz (Staff only)
     * DELETE /api/v1/admin/exams/:id
     */
    async delete(requester: Requester, examId: string): Promise<void> {
        this.checkPermission(requester, 'delete');

        try {
            const quiz = await this.examRepository.findById(examId);

            if (!quiz) {
                throw new NotFoundException('Exam not found');
            }

            await this.examRepository.delete(examId);

            this.logger.log(`Exam ${examId} deleted by ${requester.sub}`);

            // Trigger stats recalculation via NATS
            const deletedCourseIds = await this.getCourseMasterIdsForQuiz(quiz);
            for (const courseMasterId of deletedCourseIds) {
                this.natsClient.emit({ cmd: 'learning.courseMaster.recalculate_stats' }, { courseMasterId });
            }
        } catch (error: any) {
            this.logger.error(`Error deleting exam ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Get exam by ID (Staff only - includes all details)
     * GET /api/v1/admin/exams/:id
     */
    async findById(examId: string): Promise<ExamResponseDTO> {
        try {
            const quiz = await this.examRepository.findById(examId);

            if (!quiz) {
                throw new NotFoundException('Exam not found');
            }

            return this.mapper.map<any, ExamResponseDTO>(quiz, 'Quiz', 'ExamResponseDTO');
        } catch (error: any) {
            this.logger.error(`Error fetching exam ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Publish an exam/quiz (Staff only)
     * POST /api/v1/admin/exams/:id/publish
     */
    async publish(requester: Requester, examId: string): Promise<ExamResponseDTO> {
        this.checkPermission(requester, 'publish');

        try {
            const quiz = await this.examRepository.findById(examId);

            if (!quiz) {
                throw new NotFoundException('Exam not found');
            }

            if (quiz.status === ExamStatus.PUBLISHED) {
                throw new BadRequestException('Exam is already published');
            }

            // Validate quiz has sections
            const sections = (quiz.sections as any[]) || [];
            if (sections.length === 0) {
                throw new BadRequestException('Cannot publish exam without sections');
            }

            const updated = await this.examRepository.update(examId, {
                status: ExamStatus.PUBLISHED,
            });

            this.logger.log(`Exam ${examId} published by ${requester.sub}`);
            return this.mapper.map<any, ExamResponseDTO>(updated, 'Quiz', 'ExamResponseDTO');
        } catch (error: any) {
            this.logger.error(`Error publishing exam ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Get quiz statistics (Phase 3.1)
     * GET /api/admin/exams/:id/stats
     */
    async getQuizStatistics(examId: string): Promise<any> {
        try {
            const quiz = await this.examRepository.findById(examId);
            if (!quiz) {
                throw new NotFoundException('Exam not found');
            }

            // Get all attempts for this quiz
            const attempts = await this.examRepository.findAttempts({
                skip: 0,
                take: 10000, // Get all attempts
                where: {
                    quizId: examId,
                    status: { in: [ExamSessionStatus.SUBMITTED, ExamSessionStatus.COMPLETED] },
                },
            });

            const totalAttempts = attempts.length;
            const passedAttempts = attempts.filter(a => a.isPassed === true).length;
            const failedAttempts = attempts.filter(a => a.isPassed === false).length;

            // Calculate average score
            const scores = attempts
                .filter(a => a.score !== null && a.percentage !== null)
                .map(a => Number(a.percentage));
            const averageScore = scores.length > 0
                ? scores.reduce((sum, score) => sum + score, 0) / scores.length
                : 0;

            // Calculate average time taken
            const timeTaken = attempts
                .filter(a => a.timeTakenSeconds !== null)
                .map(a => a.timeTakenSeconds!);
            const averageTimeMinutes = timeTaken.length > 0
                ? timeTaken.reduce((sum, time) => sum + time, 0) / timeTaken.length / 60
                : 0;

            // Calculate pass rate
            const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

            // Group by JLPT level (if applicable)
            const byLevel: Record<string, { count: number; averageScore: number }> = {};
            if (quiz.jlptLevel) {
                byLevel[quiz.jlptLevel] = {
                    count: totalAttempts,
                    averageScore: averageScore,
                };
            }

            return {
                totalAttempts,
                passedAttempts,
                failedAttempts,
                averageScore: Math.round(averageScore * 100) / 100,
                passRate: Math.round(passRate * 100) / 100,
                averageTimeMinutes: Math.round(averageTimeMinutes * 100) / 100,
                byLevel: Object.keys(byLevel).length > 0 ? byLevel : undefined,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching quiz statistics for ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Get all attempts for a quiz (Phase 3.1)
     * GET /api/admin/exams/:id/attempts
     */
    async getQuizAttempts(examId: string, query: ExamSessionQueryDTO): Promise<PaginatedResponseDTO<ExamSessionWithExamResponseDTO>> {
        try {
            const {
                page = 1,
                limit = 10,
                status,
            } = query;

            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;

            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: any = {
                quizId: examId,
            };

            if (status) {
                whereClause.status = status;
            }

            const [total, attempts] = await Promise.all([
                this.examRepository.countAttempts(whereClause),
                this.examRepository.findAttempts({
                    skip,
                    take: validLimit,
                    where: whereClause,
                    include: {
                        quiz: true,
                    },
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: attempts.map((a: any) => {
                    const sessionDto = this.mapper.map<any, ExamSessionResponseDTO>(a, 'QuizAttempt', 'ExamSessionResponseDTO');
                    const exam = a.quiz ? this.mapper.map<any, ExamResponseDTO>(a.quiz, 'Quiz', 'ExamResponseDTO') : undefined;
                    const score = a.status === ExamSessionStatus.SUBMITTED || a.status === ExamSessionStatus.COMPLETED
                        ? (a.score ? Number(a.score) : undefined)
                        : undefined;
                    const maxScore = a.maxScore ? Number(a.maxScore) : (exam?.totalQuestions || 0);

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
            this.logger.error(`Error fetching quiz attempts for ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Get exam by ID with user session status (for learners)
     * GET /api/exams/:id
     */
    async getExamById(examId: string, userId?: string): Promise<ExamWithStatusResponseDTO> {
        try {
            const quiz = await this.examRepository.findById(examId);

            if (!quiz) {
                throw new NotFoundException('Exam not found');
            }

            // Only show published exams to learners
            if (userId && quiz.status !== ExamStatus.PUBLISHED) {
                throw new NotFoundException('Exam not found');
            }

            const examDto = this.mapper.map<any, ExamResponseDTO>(quiz, 'Quiz', 'ExamResponseDTO');

            // Get user's latest attempt if userId provided
            let userAttempt: any = null;
            if (userId) {
                const attempts = await this.examRepository.findAttempts({
                    skip: 0,
                    take: 1,
                    where: {
                        quizId: examId,
                        userId,
                    },
                    orderBy: { createdAt: 'desc' },
                });
                userAttempt = attempts[0] || null;
            }

            return {
                ...examDto,
                sessionStatus: userAttempt ? (userAttempt.status as ExamSessionStatus) : undefined,
                sessionId: userAttempt?.id,
                score: userAttempt?.status === ExamSessionStatus.SUBMITTED || userAttempt?.status === ExamSessionStatus.COMPLETED
                    ? this.calculateScore(userAttempt)
                    : undefined,
                maxScore: quiz.totalQuestions,
                progress: userAttempt ? this.calculateProgress(userAttempt, quiz.totalQuestions) : undefined,
                lastAttemptDate: userAttempt?.submittedAt || userAttempt?.startedAt,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching exam ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Get all sessions for a specific exam (for learners)
     * GET /api/exams/:id/sessions
     */
    async getExamSessions(examId: string, userId: string, query?: ExamSessionQueryDTO): Promise<PaginatedResponseDTO<ExamSessionWithExamResponseDTO>> {
        try {
            const {
                page = 1,
                limit = 10,
                status,
            } = query || {};

            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;

            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            // Verify exam exists
            const quiz = await this.examRepository.findById(examId);
            if (!quiz) {
                throw new NotFoundException('Exam not found');
            }

            const whereClause: any = {
                quizId: examId,
                userId, // Only get sessions for the requesting user
            };

            if (status) {
                whereClause.status = status;
            }

            const [total, attempts] = await Promise.all([
                this.examRepository.countAttempts(whereClause),
                this.examRepository.findAttempts({
                    skip,
                    take: validLimit,
                    where: whereClause,
                    include: {
                        quiz: true,
                    },
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: attempts.map((a: any) => {
                    const sessionDto = this.mapper.map<any, ExamSessionResponseDTO>(a, 'QuizAttempt', 'ExamSessionResponseDTO');
                    const exam = a.quiz ? this.mapper.map<any, ExamResponseDTO>(a.quiz, 'Quiz', 'ExamResponseDTO') : undefined;
                    const score = a.status === ExamSessionStatus.SUBMITTED || a.status === ExamSessionStatus.COMPLETED
                        ? (a.score ? Number(a.score) : undefined)
                        : undefined;
                    const maxScore = a.maxScore ? Number(a.maxScore) : (exam?.totalQuestions || 0);

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
            this.logger.error(`Error fetching exam sessions for ${examId}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Get attempt details with explanations (Phase 3.2)
     * GET /api/exams/sessions/:sessionId/details
     */
    async getAttemptDetails(sessionId: string, userId: string): Promise<any> {
        try {
            const attempt = await this.examRepository.findAttemptById(sessionId, {
                quiz: true,
                details: {
                    include: {
                        question: true,
                    },
                },
            }) as any;

            if (!attempt) {
                throw new NotFoundException('Exam session not found');
            }

            if (attempt.userId !== userId) {
                throw new BadRequestException('Unauthorized');
            }

            // Get quiz separately if not included
            const quiz = attempt.quiz || await this.examRepository.findById(attempt.quizId);

            // Check if quiz allows showing explanations
            const showExplanation = quiz?.showExplanation || false;

            // Get attempt details with questions
            const detailsData = await this.examRepository.findAttemptDetails(sessionId);

            // Map attempt details with conditional explanation
            const details = detailsData.map((detail: any) => {
                const question = detail.question;
                return {
                    id: detail.id,
                    questionId: detail.questionId,
                    questionText: question.questionText,
                    questionType: question.questionType,
                    userAnswer: detail.userAnswer,
                    correctAnswer: showExplanation ? question.correctAnswer : undefined,
                    isCorrect: detail.isCorrect,
                    pointsEarned: Number(detail.pointsEarned),
                    explanation: showExplanation ? question.explanation : undefined,
                    options: question.options,
                    timeSpentSeconds: detail.timeSpentSeconds,
                };
            });

            return {
                attemptId: attempt.id,
                quizId: attempt.quizId,
                quizTitle: quiz?.title,
                score: attempt.score ? Number(attempt.score) : undefined,
                maxScore: attempt.maxScore ? Number(attempt.maxScore) : undefined,
                percentage: attempt.percentage ? Number(attempt.percentage) : undefined,
                isPassed: attempt.isPassed,
                timeTakenSeconds: attempt.timeTakenSeconds,
                submittedAt: attempt.submittedAt,
                showExplanation: showExplanation,
                details: details,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching attempt details for ${sessionId}: ${error.message}`, error.stack);
            throw error;
        }
    }
}



