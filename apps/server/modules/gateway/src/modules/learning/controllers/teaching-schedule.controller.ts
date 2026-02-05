import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Inject, Req, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    TeachingScheduleCreateDTO,
    TeachingScheduleResponseDTO,
    ScheduleRequestCreateDTO,
    ScheduleRequestResponseDTO,
    Requester
} from '@workspace/schemas';
import { GatewayAuthGuard, PermissionsGuard, Permissions, successResponse } from '@server/shared';
import { Request } from 'express';

interface RequestWithUser extends Request {
    user: Requester & { email: string };
}

@Controller('api/teaching-schedules')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class TeachingScheduleController {
    constructor(@Inject('NATS_SERVICE') private client: ClientProxy) { }

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
            this.client.send({ cmd: 'learning.teachingSchedule.checkAvailability' }, {
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
        @Req() req: RequestWithUser,
        @Body() dto: TeachingScheduleCreateDTO
    ) {
        const user = req.user;
        const data = await firstValueFrom(
            this.client.send({ cmd: 'learning.teachingSchedule.assign' }, {
                ...dto,
                userId: user.sub,
                userRole: user.role,
                userEmail: user.email,
            })
        );
        return successResponse(data, 'Đã gán lịch dạy thành công');
    }

    @Get('course/:courseId')
    @Permissions('live_class.view')
    async findByCourse(@Param('courseId') courseId: string) {
        const data = await firstValueFrom(
            this.client.send({ cmd: 'learning.teachingSchedule.findByCourse' }, { courseId })
        );
        return successResponse(data);
    }

    @Delete(':id')
    @Permissions('live_class.schedule')
    async removeSchedule(
        @Req() req: RequestWithUser,
        @Param('id') id: string
    ) {
        const user = req.user;
        await firstValueFrom(
            this.client.send({ cmd: 'learning.teachingSchedule.remove' }, {
                id,
                userId: user.sub,
                userRole: user.role
            })
        );
        return successResponse(true, 'Đã xóa lịch dạy thành công');
    }

    @Post('requests')
    @Permissions('live_class.request_change')
    async createRequest(
        @Req() req: RequestWithUser,
        @Body() dto: ScheduleRequestCreateDTO
    ) {
        const user = req.user;
        const data = await firstValueFrom(
            this.client.send({ cmd: 'learning.teachingSchedule.createRequest' }, {
                ...dto,
                userId: user.sub,
                userRole: user.role,
            })
        );
        return successResponse(data, 'Đã gửi yêu cầu thay đổi lịch dạy');
    }

    @Get('requests/pending')
    @Permissions('live_class.schedule')
    async getPendingRequests() {
        const data = await firstValueFrom(
            this.client.send({ cmd: 'learning.teachingSchedule.getPendingRequests' }, {})
        );
        return successResponse(data);
    }

    @Post('requests/:id/handle')
    @Permissions('live_class.schedule')
    async handleRequest(
        @Req() req: RequestWithUser,
        @Param('id') requestId: string,
        @Body('action') action: 'approve' | 'reject'
    ) {
        const user = req.user;
        await firstValueFrom(
            this.client.send({ cmd: 'learning.teachingSchedule.handleRequest' }, {
                requestId,
                action,
                userId: user.sub,
                userRole: user.role,
            })
        );
        return successResponse(true, action === 'approve' ? 'Đã phê duyệt yêu cầu' : 'Đã từ chối yêu cầu');
    }
}
