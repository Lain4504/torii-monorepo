import { Controller, Get, Post, Body, UseGuards, Request, Inject, Param } from '@nestjs/common';
import { GatewayAuthGuard } from '@server/shared';
import { ILearningProgressService, LEARNING_PROGRESS_SERVICE_TOKEN } from '../../interfaces/services';

@Controller('learning-progress')
@UseGuards(GatewayAuthGuard)
export class LearningProgressController {
    constructor(
        @Inject(LEARNING_PROGRESS_SERVICE_TOKEN)
        private readonly service: ILearningProgressService
    ) { }

    @Get('my-courses')
    async getMyCourses(@Request() req: any) {
        const userId = req.requester.sub;
        return this.service.getMyCourses(userId);
    }

    @Post('track')
    async trackProgress(@Request() req: any, @Body() body: { lessonId: string; seconds: number; totalSeconds: number }) {
        const userId = req.requester.sub;
        return this.service.trackLessonProgress(userId, body.lessonId, body.seconds, body.totalSeconds);
    }

    @Get('stats')
    async getStats(@Request() req: any) {
        const userId = req.requester.sub;
        return this.service.getUserLearningStats(userId);
    }

    @Get('completed-lessons/:courseId')
    async getCompletedLessons(@Request() req: any, @Param('courseId') courseId: string) {
        const userId = req.requester.sub;
        return this.service.getCompletedLessons(userId, courseId);
    }

    @Get('history')
    async getHistory(@Request() req: any) {
        const userId = req.requester.sub;
        return this.service.getLearningHistory(userId);
    }
}
