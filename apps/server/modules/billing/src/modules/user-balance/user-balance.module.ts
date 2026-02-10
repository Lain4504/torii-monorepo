import { Module } from '@nestjs/common';
import { UserBalanceService } from './user-balance.service';
import { UserBalanceRepository } from './user-balance.repository';
import { PrismaModule } from '@server/shared';

@Module({
    imports: [PrismaModule],
    providers: [UserBalanceService, UserBalanceRepository],
    exports: [UserBalanceService],
})
export class UserBalanceModule { }
