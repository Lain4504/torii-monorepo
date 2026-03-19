import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JlptMockService } from './jlpt-mock.service';
import {
  JlptMockAttemptNextSectionDto,
  JlptMockAttemptSaveAnswersDto,
  JlptMockAttemptStartDto,
  JlptMockAttemptSubmitDto,
  JlptMockAttachQuestionsDto,
  JlptMockExamTemplateCreateDto,
  JlptMockExamTemplateQueryDto,
  JlptMockExamTemplateUpdateDto,
} from './dto/jlpt-mock.dto';
import {
  JlptBankQuestionCreateDto,
  JlptBankQuestionQueryDto,
  JlptBankQuestionUpdateDto,
} from './dto/jlpt-bank.dto';

@Controller()
export class JlptMockHandler {
  constructor(private readonly jlpt: JlptMockService) {}

  // --- Learner ---

  @MessagePattern({ cmd: 'academy.jlptMock.template.findAll' })
  findAllTemplates(@Payload() query: JlptMockExamTemplateQueryDto) {
    return this.jlpt.findAllTemplates(query);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.template.findById' })
  findTemplateById(@Payload() data: { id: string }) {
    return this.jlpt.findTemplateById(data.id);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.attempt.start' })
  startAttempt(
    @Payload() data: JlptMockAttemptStartDto & { requesterId?: string },
  ) {
    const userId = data.userId ?? data.requesterId;
    return this.jlpt.startAttempt(data.templateId, userId);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.attempt.saveAnswers' })
  saveAnswers(
    @Payload() data: JlptMockAttemptSaveAnswersDto & { requesterId?: string },
  ) {
    return this.jlpt.saveAnswers(data.attemptId, data.answers, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.attempt.nextSection' })
  nextSection(
    @Payload() data: JlptMockAttemptNextSectionDto & { requesterId?: string },
  ) {
    return this.jlpt.nextSection(
      data.attemptId,
      data.currentSectionOrder,
      data.requesterId,
    );
  }

  @MessagePattern({ cmd: 'academy.jlptMock.attempt.submit' })
  submitAttempt(
    @Payload() data: JlptMockAttemptSubmitDto & { requesterId?: string },
  ) {
    return this.jlpt.submitAttempt(data.attemptId, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.attempt.result' })
  getAttemptResult(@Payload() data: { attemptId: string; requesterId?: string }) {
    return this.jlpt.getAttemptResult(data.attemptId, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.attempt.findHistory' })
  findAttemptHistory(@Payload() data: { requesterId?: string; limit?: number }) {
    if (!data.requesterId) return [];
    return this.jlpt.findAttemptHistory(data.requesterId, data.limit ?? 20);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.attempt.answers' })
  getAttemptAnswers(@Payload() data: { attemptId: string; requesterId?: string }) {
    return this.jlpt.getAttemptAnswers(data.attemptId, data.requesterId);
  }

  // --- Admin (minimal) ---

  @MessagePattern({ cmd: 'academy.jlptMock.template.create' })
  createTemplate(
    @Payload() data: JlptMockExamTemplateCreateDto & { requesterId?: string },
  ) {
    const { requesterId, ...input } = data;
    return this.jlpt.createTemplate(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.template.update' })
  updateTemplate(
    @Payload()
    data: {
      id: string;
      input: JlptMockExamTemplateUpdateDto;
      requesterId?: string;
    },
  ) {
    return this.jlpt.updateTemplate(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.template.attachQuestions' })
  attachQuestions(
    @Payload() data: JlptMockAttachQuestionsDto & { requesterId?: string },
  ) {
    return this.jlpt.attachQuestions(
      data.templateId,
      data.items,
      data.requesterId,
    );
  }

  // --- Admin: JLPT Question Bank (minimal CRUD) ---

  @MessagePattern({ cmd: 'academy.jlptMock.bankQuestion.findAll' })
  findAllBankQuestions(@Payload() query: JlptBankQuestionQueryDto) {
    return this.jlpt.findAllBankQuestions(query);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.bankQuestion.create' })
  createBankQuestion(
    @Payload() data: JlptBankQuestionCreateDto & { requesterId?: string },
  ) {
    const { requesterId, ...input } = data;
    return this.jlpt.createBankQuestion(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.jlptMock.bankQuestion.update' })
  updateBankQuestion(
    @Payload()
    data: { id: string; input: JlptBankQuestionUpdateDto; requesterId?: string },
  ) {
    return this.jlpt.updateBankQuestion(data.id, data.input, data.requesterId);
  }
}

