import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  GatewayAuthGuard,
  ReqWithRequester,
  successResponse,
  errorResponse,
} from '@server/shared';
import { firstValueFrom } from 'rxjs';

@UseGuards(GatewayAuthGuard)
@Controller('api/academy/jlpt-mock')
export class JlptMockController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Get('templates')
  async findTemplates(@Req() req: ReqWithRequester, @Query() query: any) {
    try {
      const items = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.template.findAll' },
          {
            level: query.levelCode,
            status: 'PUBLISHED',
            requesterId: req.requester.sub,
          },
        ),
      );
      return successResponse({ items });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Get('templates/:id')
  async findTemplateById(
    @Req() req: ReqWithRequester,
    @Param('id') id: string,
  ) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.template.findById' },
          { id, requesterId: req.requester.sub },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Post('attempts/start')
  async startAttempt(@Req() req: ReqWithRequester, @Body() body: any) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.attempt.start' },
          {
            templateId: body.templateId,
            userId: req.requester.sub,
            requesterId: req.requester.sub,
          },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Post('attempts/save-answers')
  async saveAnswers(@Req() req: ReqWithRequester, @Body() body: any) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.attempt.saveAnswers' },
          {
            attemptId: body.attemptId,
            answers: body.answers,
            requesterId: req.requester.sub,
          },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Post('attempts/next-section')
  async nextSection(@Req() req: ReqWithRequester, @Body() body: any) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.attempt.nextSection' },
          {
            attemptId: body.attemptId,
            currentSectionOrder: body.currentSectionOrder,
            requesterId: req.requester.sub,
          },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Get('attempts/history')
  async findAttemptHistory(@Req() req: ReqWithRequester) {
    try {
      const items = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.attempt.findHistory' },
          {
            requesterId: req.requester.sub,
          },
        ),
      );
      return successResponse({ items });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Get('attempts/:id/answers')
  async getAttemptAnswers(
    @Req() req: ReqWithRequester,
    @Param('id') id: string,
  ) {
    try {
      const items = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.attempt.answers' },
          {
            attemptId: id,
            requesterId: req.requester.sub,
          },
        ),
      );
      return successResponse({ items });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Post('attempts/submit')
  async submitAttempt(@Req() req: ReqWithRequester, @Body() body: any) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.attempt.submit' },
          {
            attemptId: body.attemptId,
            requesterId: req.requester.sub,
          },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Get('attempts/:id')
  async getAttemptResult(
    @Req() req: ReqWithRequester,
    @Param('id') id: string,
  ) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.attempt.result' },
          {
            attemptId: id,
            requesterId: req.requester.sub,
          },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  // --- Admin Endpoints ---

  @Get('admin/templates')
  async adminFindAllTemplates(
    @Req() req: ReqWithRequester,
    @Query() query: any,
  ) {
    try {
      const items = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.template.findAll' },
          { ...query, requesterId: req.requester.sub },
        ),
      );
      return successResponse({ items });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Post('admin/templates')
  async adminCreateTemplate(@Req() req: ReqWithRequester, @Body() body: any) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.template.create' },
          { ...body, requesterId: req.requester.sub },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Patch('admin/templates/:id')
  async adminUpdateTemplate(
    @Req() req: ReqWithRequester,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.template.update' },
          { id, ...body, requesterId: req.requester.sub },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Post('admin/templates/:id/attach-questions')
  async adminAttachQuestions(
    @Req() req: ReqWithRequester,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.template.attachQuestions' },
          { templateId: id, items: body.items, requesterId: req.requester.sub },
        ),
      );
      return successResponse(result);
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Get('admin/bank-questions')
  async adminFindBankQuestions(
    @Req() req: ReqWithRequester,
    @Query() query: any,
  ) {
    try {
      const items = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.bankQuestion.findAll' },
          { ...query, requesterId: req.requester.sub },
        ),
      );
      return successResponse({ items });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Post('admin/bank-questions')
  async adminCreateBankQuestion(
    @Req() req: ReqWithRequester,
    @Body() body: any,
  ) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.bankQuestion.create' },
          { ...body, requesterId: req.requester.sub },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }

  @Patch('admin/bank-questions/:id')
  async adminUpdateBankQuestion(
    @Req() req: ReqWithRequester,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.jlptMock.bankQuestion.update' },
          { id, ...body, requesterId: req.requester.sub },
        ),
      );
      return successResponse({ item });
    } catch (e: any) {
      return errorResponse(e.message);
    }
  }
}
