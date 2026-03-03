import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Inject,
    Req,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    ZodValidationPipe,
    ReqWithRequester,
    successResponse,
} from '@server/shared';
import {
    submitAssignmentDto,
    gradeSubmissionDto,
    returnSubmissionDto
} from '@workspace/schemas';

@Controller('api/submissions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class SubmissionController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    private sendCmd(cmd: string, payload: any) {
        return firstValueFrom(this.natsClient.send({ cmd: `learning.submission.${cmd}` }, payload));
    }

    @Post(':assignmentId')
    submit(@Param('assignmentId') assignmentId: string, @Body(new ZodValidationPipe(submitAssignmentDto)) dto: any, @Req() req: ReqWithRequester) {
        return this.sendCmd('submit', { assignmentId, ...dto, requester: req.requester });
    }

    @Post(':assignmentId/draft')
    draft(@Param('assignmentId') assignmentId: string, @Body(new ZodValidationPipe(submitAssignmentDto)) dto: any, @Req() req: ReqWithRequester) {
        return this.sendCmd('saveDraft', { assignmentId, ...dto, requester: req.requester });
    }

    @Get('my/:assignmentId')
    my(
        @Param('assignmentId') assignmentId: string,
        @Query('courseRunId') courseRunId: string,
        @Req() req: ReqWithRequester
    ) {
        return this.sendCmd('getMySubmission', { assignmentId, userId: req.requester.sub, courseRunId });
    }

    @Get(':id/submissions')
    @Permissions('submission.grade')
    async getSubmissions(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query('courseRunId') courseRunId?: string
    ) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.submission.findAll' }, { assignmentId: id, courseRunId })
        );
        return successResponse({ submissions: result });
    }

    @Put(':id/grade')
    @Permissions('submission.grade')
    grade(@Param('id') id: string, @Body(new ZodValidationPipe(gradeSubmissionDto)) dto: any, @Req() req: ReqWithRequester) {
        return this.sendCmd('grade', { id, ...dto, requester: req.requester });
    }

    @Post(':id/return')
    @Permissions('submission.grade')
    return(@Param('id') id: string, @Body(new ZodValidationPipe(returnSubmissionDto)) dto: any, @Req() req: ReqWithRequester) {
        return this.sendCmd('return', { id, ...dto, requester: req.requester });
    }
}
