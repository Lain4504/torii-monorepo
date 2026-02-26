import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    Inject,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    successResponse,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/live-sessions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LiveSessionController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy
    ) { }

    @Get('course/:courseId')
    async findByCourse(@Param('courseId') courseId: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.liveSession.findByCourseId' }, { courseId })
        );
        return successResponse(result);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.liveSession.findById' }, { id })
        );
        return successResponse(result);
    }

    @Delete(':id')
    @Permissions('live_class.schedule')
    async delete(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.delete' },
                { id, userId: requester.sub }
            )
        );
        return successResponse(result, 'Live session deleted successfully');
    }

    @Post(':id/start')
    @Permissions('live_class.manage')
    async start(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.start' },
                { id, userId: requester.sub }
            )
        );
        return successResponse(result, 'Live session started');
    }

    @Post(':id/end')
    @Permissions('live_class.manage')
    async end(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.end' },
                { id, userId: requester.sub }
            )
        );
        return successResponse(result, 'Live session ended');
    }

    @Post(':id/join')
    async join(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.join' },
                { id, userId: requester.sub }
            )
        );
        return successResponse(result);
    }
}
