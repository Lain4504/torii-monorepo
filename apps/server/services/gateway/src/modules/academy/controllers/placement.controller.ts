import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  ReqWithRequester,
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
import { ZodValidationPipe } from '@server/shared';

@Controller('api/academy/placement')
@UseGuards(GatewayAuthGuard)
export class PlacementController {
  constructor(
    @Inject('NATS_SERVICE') private readonly nats: ClientProxy,
  ) { }

  @Get('info')
  @HttpCode(HttpStatus.OK)
  async getInfo(@Req() req: ReqWithRequester) {
    const data = await firstValueFrom<AcademyPlacementInfoResponseDTO>(
      this.nats.send(
        { cmd: 'academy.placement.info' },
        { userId: req.requester.sub },
      ),
    );
    return successResponse(data);
  }

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async start(@Req() req: ReqWithRequester) {
    const data = await firstValueFrom<AcademyPlacementStartResponseDTO>(
      this.nats.send(
        { cmd: 'academy.placement.start' },
        { userId: req.requester.sub },
      ),
    );
    return successResponse(data);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @Req() req: ReqWithRequester,
    @Body(new ZodValidationPipe(academyPlacementSubmitDTOSchema))
    dto: AcademyPlacementSubmitDTO,
  ) {
    const coreResult = await firstValueFrom<AcademyPlacementSubmitResponseDTO>(
      this.nats.send(
        { cmd: 'academy.placement.submit' },
        {
          userId: req.requester.sub,
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
          requester: req.requester,
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

