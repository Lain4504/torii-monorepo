import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PROFILES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IProfilesService } from '@server/gamification/interfaces/services';

@Controller()
export class ProfilesHandler {
    constructor(
        @Inject(PROFILES_SERVICE_TOKEN) private readonly profilesService: IProfilesService
    ) { }

    // Legacy alias
    @MessagePattern({ cmd: 'gamification.getProfile' })
    async getProfileLegacy(@Payload() data: { userId: string }) {
        return this.profilesService.getGamificationProfile(data.userId);
    }

    @MessagePattern({ cmd: 'gamification.profile.get' })
    async getProfile(@Payload() data: { userId: string }) {
        return this.profilesService.getGamificationProfile(data.userId);
    }

    // Legacy alias
    @MessagePattern({ cmd: 'gamification.getStreak' })
    async getStreakStatusLegacy(@Payload() data: { userId: string }) {
        return this.profilesService.getStreakStatus(data.userId);
    }

    @MessagePattern({ cmd: 'gamification.streak.status' })
    async getStreakStatus(@Payload() data: { userId: string }) {
        return this.profilesService.getStreakStatus(data.userId);
    }

    // Legacy alias
    @MessagePattern({ cmd: 'gamification.markStreakToastShown' })
    async markToastShownLegacy(@Payload() data: { userId: string }) {
        return this.profilesService.markStreakToastShown(data.userId);
    }

    @MessagePattern({ cmd: 'gamification.streak.markToastShown' })
    async markToastShown(@Payload() data: { userId: string }) {
        return this.profilesService.markStreakToastShown(data.userId);
    }
}
