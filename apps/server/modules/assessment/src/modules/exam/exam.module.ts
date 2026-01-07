import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';

@Module({
    imports: [SharedModule],
    controllers: [ExamController],
    providers: [ExamService],
    exports: [ExamService],
})
export class ExamModule { }










