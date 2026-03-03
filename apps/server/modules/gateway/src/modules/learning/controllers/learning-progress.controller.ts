import { Controller, Get, Post, Body, Param, Req, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { successResponse, errorResponse, GatewayAuthGuard, ReqWithRequester } from '@server/shared';

@Controller('api/learning-progress')
@UseGuards(GatewayAuthGuard)
export class LearningProgressController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get('my-courses')
    async getMyCourses(@Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.myCourses' }, { userId: requester.sub })
            );
            return successResponse({ courses: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch my courses');
        }
    }

    @Post('track')
    async trackProgress(@Req() req: ReqWithRequester, @Body() body: { lessonId: string; seconds: number; totalSeconds: number }) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.track' }, {
                    userId: requester.sub,
                    lessonId: body.lessonId,
                    seconds: body.seconds,
                    totalSeconds: body.totalSeconds
                })
            );
            return successResponse({ success: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to track progress');
        }
    }

    @Get('stats')
    async getStats(@Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.stats' }, { userId: requester.sub })
            );
            return successResponse({ stats: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch stats');
        }
    }

    @Get('completed-lessons/:courseMasterId')
    async getCompletedLessons(@Req() req: ReqWithRequester, @Param('courseMasterId') courseMasterId: string) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.completedLessons' }, { userId: requester.sub, courseMasterId })
            );
            return successResponse({ lessonIds: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch completed lessons');
        }
    }

    @Get('history')
    async getHistory(@Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.history' }, { userId: requester.sub })
            );
            return successResponse({ history: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch history');
        }
    }
}
