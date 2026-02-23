import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { EXAM_SERVICE_TOKEN, IExamService } from '@server/learning/interfaces/services/i-exam.service';
import { ExamQueryDTO, ExamCreateDTO, ExamUpdateDTO, ExamSessionAnswersDTO, ExamSessionQueryDTO, Requester, UserRole } from '@workspace/schemas';

@Controller()
export class ExamHandler {
    private readonly logger = new Logger(ExamHandler.name);

    constructor(
        @Inject(EXAM_SERVICE_TOKEN)
        private readonly examService: IExamService
    ) { }

    // --- Exam Controller Methods ---

    @MessagePattern({ cmd: 'learning.exam.findAllWithStatus' })
    async findAllWithStatus(@Payload() data: { query: ExamQueryDTO, requester: Requester }) {
        return this.examService.findAllWithStatus(data.query, data.requester.sub);
    }

    @MessagePattern({ cmd: 'learning.exam.getUserSessions' })
    async getUserSessions(@Payload() data: { requester: Requester, query: ExamSessionQueryDTO }) {
        return this.examService.getUserSessions(data.requester.sub, data.query);
    }

    @MessagePattern({ cmd: 'learning.exam.saveAnswers' })
    async saveAnswers(@Payload() data: { sessionId: string, requester: Requester, dto: ExamSessionAnswersDTO }) {
        return this.examService.saveAnswers(data.sessionId, data.requester.sub, data.dto);
    }

    @MessagePattern({ cmd: 'learning.exam.submitSession' })
    async submitSession(@Payload() data: { sessionId: string, requester: Requester }) {
        return this.examService.submitSession(data.sessionId, data.requester.sub);
    }

    @MessagePattern({ cmd: 'learning.exam.startExam' })
    async startExam(@Payload() data: { examId: string, requester: Requester }) {
        return this.examService.startExam(data.examId, data.requester.sub);
    }

    @MessagePattern({ cmd: 'learning.exam.getAttemptDetails' })
    async getAttemptDetails(@Payload() data: { sessionId: string, requester: Requester }) {
        return this.examService.getAttemptDetails(data.sessionId, data.requester.sub);
    }

    @MessagePattern({ cmd: 'learning.exam.getExamById' })
    async getExamById(@Payload() data: { examId: string, requester?: Requester }) {
        return this.examService.getExamById(data.examId, data.requester?.sub);
    }

    @MessagePattern({ cmd: 'learning.exam.getExamSessions' })
    async getExamSessions(@Payload() data: { examId: string, requester: Requester, query?: ExamSessionQueryDTO }) {
        return this.examService.getExamSessions(data.examId, data.requester.sub, data.query);
    }

    // --- Exam Admin Controller Methods ---

    @MessagePattern({ cmd: 'learning.exam-admin.findAll' })
    async findAllAdmin(@Payload() query: ExamQueryDTO) {
        return this.examService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.exam-admin.findOne' })
    async findOneAdmin(@Payload() data: { id: string }) {
        return this.examService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'learning.exam-admin.create' })
    async createAdmin(@Payload() data: ExamCreateDTO & { requester: Requester }) {
        const { requester, ...dto } = data;
        return this.examService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.exam-admin.update' })
    async updateAdmin(@Payload() data: ExamUpdateDTO & { id: string, requester: Requester }) {
        const { id, requester, ...dto } = data;
        return this.examService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.exam-admin.delete' })
    async deleteAdmin(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.examService.delete(requester, id);
    }

    @MessagePattern({ cmd: 'learning.exam-admin.publish' })
    async publishAdmin(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.examService.publish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.exam-admin.getStats' })
    async getStatsAdmin(@Payload() data: { id: string }) {
        return this.examService.getQuizStatistics(data.id);
    }

    @MessagePattern({ cmd: 'learning.exam-admin.getQuizAttempts' })
    async getQuizAttemptsAdmin(@Payload() data: { id: string, query: ExamSessionQueryDTO }) {
        return this.examService.getQuizAttempts(data.id, data.query);
    }
}

