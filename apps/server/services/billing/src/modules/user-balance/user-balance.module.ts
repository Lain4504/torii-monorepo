import { Module } from '@nestjs/common';
import { UserBalanceService } from './user-balance.service';
import { UserBalanceRepository } from './user-balance.repository';
import { FeatureQuotaService } from './feature-quota.service';
import { UserBalanceHandler } from './user-balance.handler';
import { PrismaModule } from '@server/shared';

@Module({
    imports: [PrismaModule],
    controllers: [UserBalanceHandler],
    providers: [UserBalanceService, UserBalanceRepository, FeatureQuotaService],
    exports: [UserBalanceService, FeatureQuotaService],
})
export class UserBalanceModule { }
