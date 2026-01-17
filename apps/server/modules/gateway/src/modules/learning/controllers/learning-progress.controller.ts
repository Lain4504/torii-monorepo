import { Controller, Get, Post, Body, Param, Req, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { successResponse, errorResponse } from '@server/shared';
import { Request } from 'express';
import { GatewayAuthGuard } from '@server/shared';

@Controller('api/learning-progress')
@UseGuards(GatewayAuthGuard)
export class LearningProgressController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get('my-courses')
    async getMyCourses(@Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.myCourses' }, { userId: user.sub })
            );
            return successResponse({ courses: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch my courses');
        }
    }

    @Post('track')
    async trackProgress(@Req() req: Request, @Body() body: { lessonId: string; seconds: number; totalSeconds: number }) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.track' }, {
                    userId: user.sub,
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
    async getStats(@Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.stats' }, { userId: user.sub })
            );
            return successResponse({ stats: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch stats');
        }
    }

    @Get('completed-lessons/:courseId')
    async getCompletedLessons(@Req() req: Request, @Param('courseId') courseId: string) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.completedLessons' }, { userId: user.sub, courseId })
            );
            return successResponse({ lessonIds: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch completed lessons');
        }
    }

    @Get('history')
    async getHistory(@Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.progress.history' }, { userId: user.sub })
            );
            return successResponse({ history: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch history');
        }
    }
}
