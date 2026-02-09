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
    Public,
    successResponse,
    ZodValidationPipe,
} from '@server/shared';
import { Request } from 'express';
import { 
    Requester, 
    submitAssignmentDto, 
    gradeSubmissionDto, 
    returnSubmissionDto 
} from '@workspace/schemas';

interface RequestWithUser extends Request {
    user: Requester & { email: string };
}

@Controller('api/submissions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class SubmissionController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    private sendCmd(cmd: string, payload: any) {
        return firstValueFrom(this.natsClient.send({ cmd: `learning.submission.${cmd}` }, payload));
    }

    // Specific routes first to avoid conflicts
    @Get('my/:assignmentId')
    @Public()
    async my(@Param('assignmentId') assignmentId: string, @Req() req: RequestWithUser) {
        const result = await this.sendCmd('getMySubmission', { assignmentId, userId: req.user.sub });
        return successResponse({ submission: result });
    }

    @Get('assignment/:assignmentId')
    @Permissions('assignment.grade')
    async all(@Param('assignmentId') assignmentId: string) {
        const result = await this.sendCmd('findAll', { assignmentId });
        return successResponse({ submissions: result });
    }

    @Post(':assignmentId/draft')
    @Public()
    @UsePipes(new ZodValidationPipe(submitAssignmentDto))
    async draft(@Param('assignmentId') assignmentId: string, @Body() dto: any, @Req() req: RequestWithUser) {
        const result = await this.sendCmd('saveDraft', { assignmentId, ...dto, requester: req.user });
        return successResponse({ submission: result });
    }

    @Put(':id/grade')
    @Permissions('assignment.grade')
    async grade(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(gradeSubmissionDto)) dto: any,
        @Req() req: RequestWithUser
    ) {
        const result = await this.sendCmd('grade', { id, ...dto, requester: req.user });
        return successResponse({ submission: result });
    }

    @Put(':id/return')
    @Permissions('assignment.grade')
    async return(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(returnSubmissionDto)) dto: any,
        @Req() req: RequestWithUser
    ) {
        const result = await this.sendCmd('return', { id, ...dto, requester: req.user });
        return successResponse({ submission: result });
    }

    // Generic routes last
    @Get(':id')
    @Permissions('assignment.grade')
    async findOne(@Param('id') id: string) {
        const result = await this.sendCmd('findOne', { id });
        return successResponse({ submission: result });
    }

    @Post(':assignmentId')
    @Public()
    async submit(
        @Param('assignmentId') assignmentId: string,
        @Body(new ZodValidationPipe(submitAssignmentDto)) dto: any,
        @Req() req: RequestWithUser
    ) {
        const result = await this.sendCmd('submit', { assignmentId, ...dto, requester: req.user });
        return successResponse({ submission: result });
    }
}
