import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { SharedModule, PrismaModule } from '@server/shared';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';
import { QuestionBankController } from './interfaces/http/question-bank.controller';
import { ExamModule } from './modules/exam/exam.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    PrismaModule,
    QuestionBankModule,
    ExamModule,
  ],
  controllers: [QuestionBankController],
  providers: [],
})
export class AssessmentModule { }
