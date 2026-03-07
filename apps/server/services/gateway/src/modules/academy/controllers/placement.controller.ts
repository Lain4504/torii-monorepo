import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  NatsRequest,
  successResponse,
} from '@server/shared';
import {
  AcademyPlacementInfoResponseDTO,
  AcademyPlacementStartResponseDTO,
  AcademyPlacementSubmitDTO,
  AcademyPlacementSubmitResponseDTO,
  academyPlacementSubmitDTOSchema,
  Requester,
} from '@workspace/schemas';
import { ZodValidationPipe } from '@server/shared/zod-validation.pipe';

@Controller('api/academy/placement')
@UseGuards(GatewayAuthGuard)
export class PlacementController {
  constructor(
    @Inject('NATS_SERVICE') private readonly nats: ClientProxy,
  ) { }

  @Get('info')
  @HttpCode(HttpStatus.OK)
  async getInfo(@NatsRequest() requester: Requester) {
    const data = await firstValueFrom<AcademyPlacementInfoResponseDTO>(
      this.nats.send(
        { cmd: 'academy.placement.info' },
        { userId: requester.sub },
      ),
    );
    return successResponse(data);
  }

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async start(@NatsRequest() requester: Requester) {
    const data = await firstValueFrom<AcademyPlacementStartResponseDTO>(
      this.nats.send(
        { cmd: 'academy.placement.start' },
        { userId: requester.sub },
      ),
    );
    return successResponse(data);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @NatsRequest() requester: Requester,
    @Body(new ZodValidationPipe(academyPlacementSubmitDTOSchema))
    dto: AcademyPlacementSubmitDTO,
  ) {
    const coreResult = await firstValueFrom<AcademyPlacementSubmitResponseDTO>(
      this.nats.send(
        { cmd: 'academy.placement.submit' },
        {
          userId: requester.sub,
          attemptId: dto.attemptId,
          answers: dto.answers,
        },
      ),
    );

    const aiResult = await firstValueFrom(
      this.nats.send(
        { cmd: 'agents.assessment.recommendCourses' },
        {
          placementResultId: coreResult.attemptId,
          requester,
        },
      ),
    );

    const merged = {
      ...coreResult,
      analysis: aiResult.analysis,
      studyPlan: aiResult.studyPlan,
      recommendations: (aiResult.recommendedCourses || []).map((c: any) => ({
        classId: c.id,
        title: c.courseProfile?.title ?? '',
        level: c.courseProfile?.level ?? null,
        reason: `Recommended for level ${coreResult.assessedLevel}`,
      })),
      strengths: aiResult.strengths || [],
      weaknesses: aiResult.weaknesses || [],
    };

    return successResponse(merged);
  }
}

