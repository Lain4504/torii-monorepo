import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    Inject,
    HttpCode,
    HttpStatus,
    Req,
    ParseUUIDPipe,
    UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    successResponse,
    ZodValidationPipe,
    ReqWithRequester,
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
    @UsePipes(new ZodValidationPipe(submitAssignmentDto))
    submit(@Param('assignmentId') assignmentId: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        return this.sendCmd('submit', { assignmentId, ...dto, requester: req.requester });
    }

    @Post(':assignmentId/draft')
    @UsePipes(new ZodValidationPipe(submitAssignmentDto))
    draft(@Param('assignmentId') assignmentId: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        return this.sendCmd('saveDraft', { assignmentId, ...dto, requester: req.requester });
    }

    @Get('my/:assignmentId')
    my(@Param('assignmentId') assignmentId: string, @Req() req: ReqWithRequester) {
        return this.sendCmd('getMySubmission', { assignmentId, userId: req.requester.sub });
    }

    @Get('assignment/:assignmentId')
    @Permissions('assignment.grade')
    all(@Param('assignmentId') assignmentId: string) {
        return this.sendCmd('findAll', { assignmentId });
    }

    @Put(':id/grade')
    @Permissions('assignment.grade')
    @UsePipes(new ZodValidationPipe(gradeSubmissionDto))
    grade(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        return this.sendCmd('grade', { id, ...dto, requester: req.requester });
    }

    @Post(':id/return')
    @Permissions('assignment.grade')
    @UsePipes(new ZodValidationPipe(returnSubmissionDto))
    return(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        return this.sendCmd('return', { id, ...dto, requester: req.requester });
    }
}
