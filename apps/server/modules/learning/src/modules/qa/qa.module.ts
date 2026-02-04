import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { QARepository } from './qa.repository';
import { QAService } from './qa.service';

@Module({
    imports: [PrismaModule],
    providers: [QARepository, QAService],
    exports: [QAService],
})
export class QAModule { }
