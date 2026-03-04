import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LEARNING_PROGRESS_SERVICE_TOKEN, ILearningProgressService } from '@server/learning/interfaces/services';

@Controller()
export class LearningProgressHandler {
    constructor(
        @Inject(LEARNING_PROGRESS_SERVICE_TOKEN) private readonly service: ILearningProgressService
    ) { }

    @MessagePattern({ cmd: 'learning.progress.myCourses' })
    async getMyCourses(@Payload() data: { userId: string }) {
        return this.service.getMyCourses(data.userId);
    }

    @MessagePattern({ cmd: 'learning.progress.track' })
    async trackProgress(@Payload() data: { userId: string, lessonId: string, seconds: number, totalSeconds: number }) {
        return this.service.trackLessonProgress(data.userId, data.lessonId, data.seconds, data.totalSeconds);
    }

    @MessagePattern({ cmd: 'learning.progress.stats' })
    async getStats(@Payload() data: { userId: string }) {
        return this.service.getUserLearningStats(data.userId);
    }

    @MessagePattern({ cmd: 'learning.progress.completedLessons' })
    async getCompletedLessons(@Payload() data: { userId: string, courseMasterId: string }) {
        return this.service.getCompletedLessons(data.userId, data.courseMasterId);
    }

    @MessagePattern({ cmd: 'learning.progress.history' })
    async getHistory(@Payload() data: { userId: string }) {
        return this.service.getLearningHistory(data.userId);
    }
}

