import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { PrismaModule } from '@server/shared/prisma/prisma.module';
import { CommerceModule } from '../commerce/commerce.module';

@Module({
    imports: [PrismaModule, CommerceModule],
    providers: [GamificationService],
    controllers: [GamificationController],
    exports: [GamificationService],
})
export class GamificationModule { }
