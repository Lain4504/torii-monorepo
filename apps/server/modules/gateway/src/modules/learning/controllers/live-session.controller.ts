import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
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
} from '@server/shared';
import {
    LiveSessionCreateDTO,
    LiveSessionUpdateDTO,
    ReqWithRequester,
} from '@workspace/schemas';

@Controller('live-sessions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LiveSessionController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy
    ) { }

    @Post()
    @Permissions('live_class.schedule')
    async create(@Body() dto: LiveSessionCreateDTO, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.create' },
                { ...dto, userId: requester.sub }
            )
        );
        return successResponse(result, 'Live session scheduled successfully');
    }

    @Get('course/:courseId')
    async findByCourse(@Param('courseId') courseId: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.liveSession.findByCourseId' }, { courseId })
        );
        return successResponse(result);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.liveSession.findOne' }, { id })
        );
        return successResponse(result);
    }

    @Put(':id')
    @Permissions('live_class.schedule')
    async update(
        @Param('id') id: string,
        @Body() dto: LiveSessionUpdateDTO,
        @Req() req: ReqWithRequester
    ) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.update' },
                { id, ...dto, userId: requester.sub }
            )
        );
        return successResponse(result, 'Live session updated successfully');
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
}
