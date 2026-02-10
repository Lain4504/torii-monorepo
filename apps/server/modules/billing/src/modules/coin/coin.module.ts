import { Module } from '@nestjs/common';
import { CoinService } from './coin.service';
import { CoinRepository } from './coin.repository';
import { PrismaModule } from '@server/shared';

@Module({
    imports: [PrismaModule],
    providers: [CoinService, CoinRepository],
    exports: [CoinService],
})
export class CoinModule { }
