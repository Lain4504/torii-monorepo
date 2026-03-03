import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PROFILES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IProfilesService } from '@server/gamification/interfaces/services';

@Controller()
export class ProfilesHandler {
    constructor(
        @Inject(PROFILES_SERVICE_TOKEN) private readonly profilesService: IProfilesService
    ) { }

    @MessagePattern({ cmd: 'gamification.getProfile' })
    @MessagePattern({ cmd: 'gamification.profile.get' }) // Keep both for safety during transition
    async getProfile(@Payload() data: { userId: string }) {
        return this.profilesService.getGamificationProfile(data.userId);
    }

    @MessagePattern({ cmd: 'gamification.getStreak' })
    @MessagePattern({ cmd: 'gamification.streak.status' })
    async getStreakStatus(@Payload() data: { userId: string }) {
        return this.profilesService.getStreakStatus(data.userId);
    }

    @MessagePattern({ cmd: 'gamification.markStreakToastShown' })
    @MessagePattern({ cmd: 'gamification.streak.markToastShown' })
    async markToastShown(@Payload() data: { userId: string }) {
        return this.profilesService.markStreakToastShown(data.userId);
    }
}
