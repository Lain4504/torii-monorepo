import { Module } from '@nestjs/common';
import { QuotaService } from './quota.service';
import { QuotaHandler } from './quota.handler';

@Module({
    providers: [QuotaService],
    controllers: [QuotaHandler],
    exports: [QuotaService],
})
export class QuotaModule { }
