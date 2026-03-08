import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AchievementService } from './achievement.service';
import { GamificationController } from './gamification.controller';
import { PrismaModule } from '@server/shared/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [GamificationService, AchievementService],
    controllers: [GamificationController],
    exports: [GamificationService, AchievementService],
})
export class GamificationModule { }
