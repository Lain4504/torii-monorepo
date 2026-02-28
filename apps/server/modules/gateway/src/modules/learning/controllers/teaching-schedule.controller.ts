import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Inject, Req, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    TeachingScheduleCreateDTO,
    ScheduleRequestCreateDTO,
} from '@workspace/schemas';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    successResponse,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/teaching-schedules')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class TeachingScheduleController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get('check-availability')
    @Permissions('live_class.schedule')
    async checkAvailability(
        @Query('lecturerId') lecturerId: string,
        @Query('dayOfWeek', ParseIntPipe) dayOfWeek: number,
        @Query('startTime') startTime: string,
        @Query('duration', ParseIntPipe) duration: number,
        @Query('excludeScheduleId') excludeScheduleId?: string,
    ) {
        const data = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.teachingSchedule.checkAvailability' }, {
                lecturerId,
                dayOfWeek,
                startTime,
                duration,
                excludeScheduleId,
            })
        );
        return successResponse(data);
    }

    @Post()
    @Permissions('live_class.schedule')
    async assignSchedule(
        @Req() req: ReqWithRequester,
        @Body() dto: TeachingScheduleCreateDTO
    ) {
        const requester = req.requester;
        const data = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.teachingSchedule.assign' }, {
                ...dto,
                requester,
            })
        );
        return successResponse(data, 'Đã gán lịch dạy thành công');
    }

    @Get('course/:courseId')
    @Permissions('schedule.view')
    async findByCourse(@Param('courseId') courseId: string) {
        const data = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.teachingSchedule.findByCourse' }, { courseId })
        );
        return successResponse(data);
    }

    @Delete(':id')
    @Permissions('live_class.schedule')
    async removeSchedule(
        @Req() req: ReqWithRequester,
        @Param('id') id: string
    ) {
        const requester = req.requester;
        await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.teachingSchedule.remove' }, {
                id,
                requester
            })
        );
        return successResponse(true, 'Đã xóa lịch dạy thành công');
    }

    @Post('requests')
    @Permissions('live_class.schedule', 'schedule.view')
    async createRequest(
        @Req() req: ReqWithRequester,
        @Body() dto: ScheduleRequestCreateDTO
    ) {
        const requester = req.requester;
        const data = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.teachingSchedule.createRequest' }, {
                ...dto,
                requester,
            })
        );
        return successResponse(data, 'Đã gửi yêu cầu thay đổi lịch dạy');
    }

    @Get('requests/pending')
    @Permissions('live_class.schedule', 'schedule.view')
    async getPendingRequests(@Req() req: ReqWithRequester) {
        const requester = req.requester;
        const data = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.teachingSchedule.getPendingRequests' }, { requester })
        );
        return successResponse(data);
    }

    @Post('requests/:id/handle')
    @Permissions('live_class.schedule')
    async handleRequest(
        @Req() req: ReqWithRequester,
        @Param('id') requestId: string,
        @Body('action') action: 'approve' | 'reject'
    ) {
        const requester = req.requester;
        await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.teachingSchedule.handleRequest' }, {
                requestId,
                action,
                requester,
            })
        );
        return successResponse(true, action === 'approve' ? 'Đã phê duyệt yêu cầu' : 'Đã từ chối yêu cầu');
    }
}
