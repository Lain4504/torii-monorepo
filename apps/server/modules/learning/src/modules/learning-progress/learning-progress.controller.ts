import { Controller, Get, Post, Body, UseGuards, Request, Inject, Param } from '@nestjs/common';
import { GatewayAuthGuard, successResponse } from '@server/shared';
import { ILearningProgressService, LEARNING_PROGRESS_SERVICE_TOKEN } from '@server/learning/interfaces/services';

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
        const result = await this.service.getMyCourses(userId);
        return successResponse({ courses: result });
    }

    @Post('track')
    async trackProgress(@Request() req: any, @Body() body: { lessonId: string; seconds: number; totalSeconds: number }) {
        const userId = req.requester.sub;
        const result = await this.service.trackLessonProgress(userId, body.lessonId, body.seconds, body.totalSeconds);
        return successResponse({ success: result });
    }

    @Get('stats')
    async getStats(@Request() req: any) {
        const userId = req.requester.sub;
        const result = await this.service.getUserLearningStats(userId);
        return successResponse({ stats: result });
    }

    @Get('completed-lessons/:courseId')
    async getCompletedLessons(@Request() req: any, @Param('courseId') courseId: string) {
        const userId = req.requester.sub;
        const result = await this.service.getCompletedLessons(userId, courseId);
        return successResponse({ lessonIds: result });
    }

    @Get('history')
    async getHistory(@Request() req: any) {
        const userId = req.requester.sub;
        const result = await this.service.getLearningHistory(userId);
        return successResponse({ history: result });
    }
}

