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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    successResponse,
} from '@server/shared';
import { Request } from 'express';
import { Requester } from '@workspace/schemas';

interface RequestWithUser extends Request {
    user: Requester & { email: string };
}

@Controller('api/assignments/:assignmentId/submissions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AssignmentSubmissionController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('draft')
    async saveDraft(
        @Param('assignmentId', new ParseUUIDPipe()) assignmentId: string,
        @Body() dto: any,
        @Req() req: RequestWithUser
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.submission.saveDraft' },
                { assignmentId, ...dto, requester: req.user }
            )
        );
        return successResponse(result, 'Draft saved successfully');
    }

    @Post('submit')
    async submit(
        @Param('assignmentId', new ParseUUIDPipe()) assignmentId: string,
        @Body() dto: any,
        @Req() req: RequestWithUser
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.submission.submit' },
                { assignmentId, ...dto, requester: req.user }
            )
        );
        return successResponse(result, 'Assignment submitted successfully');
    }

    @Get('my-submission')
    async getMySubmission(
        @Param('assignmentId', new ParseUUIDPipe()) assignmentId: string,
        @Req() req: RequestWithUser
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.submission.getMySubmission' },
                { assignmentId, userId: req.user.sub }
            )
        );
        return successResponse(result);
    }

    @Get()
    @Permissions('assignment.grade')
    async getSubmissions(@Param('assignmentId', new ParseUUIDPipe()) assignmentId: string) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.submission.findAll' },
                { assignmentId }
            )
        );
        return successResponse(result);
    }
}

@Controller('api/submissions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class SubmissionController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Put(':id/grade')
    @Permissions('assignment.grade')
    async grade(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: any,
        @Req() req: RequestWithUser
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.submission.grade' },
                { id, ...dto, requester: req.user }
            )
        );
        return successResponse(result, 'Submission graded successfully');
    }

    @Post(':id/return')
    @Permissions('assignment.grade')
    async returnSubmission(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: any,
        @Req() req: RequestWithUser
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.submission.return' },
                { id, ...dto, requester: req.user }
            )
        );
        return successResponse(result, 'Submission returned successfully');
    }
}
