import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AchievementService } from './achievement.service';
import { GamificationController } from './gamification.controller';
import { PrismaModule, NatsClientModule } from '@server/shared';

@Module({
    imports: [PrismaModule, NatsClientModule],
    providers: [GamificationService, AchievementService],
    controllers: [GamificationController],
    exports: [GamificationService, AchievementService],
})
export class GamificationModule { }
