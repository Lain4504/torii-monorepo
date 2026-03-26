import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  ZodValidationPipe,
  successResponse,
  ReqWithRequester,
} from '@server/shared';
import {
  AcademyUpdateAssessmentPlanDTO,
  academyUpdateAssessmentPlanDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/assessment-plans')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AcademyAssessmentPlanController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get(':courseProfileId')
  @Permissions('academy.content.read')
  async findByCourseProfileId(
    @Param('courseProfileId', new ParseUUIDPipe()) id: string,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assessmentPlan.findByCourseProfileId' }, { id }),
    );
    return successResponse({ items });
  }

  @Post('update')
  @Permissions('academy.content.write')
  async update(
    @Body(new ZodValidationPipe(academyUpdateAssessmentPlanDTOSchema))
    dto: AcademyUpdateAssessmentPlanDTO,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assessmentPlan.update' }, dto),
    );
    return successResponse(result);
  }

  @Get('learner/status')
  async getLearnerStatus(
    @Query('classId') classId: string,
    @Query('enrollmentId') enrollmentId: string,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.assessmentPlan.getLearnerStatus' },
        { 
          userId: req.requester?.sub, 
          classId: classId || undefined, 
          enrollmentId: enrollmentId || undefined,
        },
      ),
    );
    return successResponse({ items: result });
  }
}
