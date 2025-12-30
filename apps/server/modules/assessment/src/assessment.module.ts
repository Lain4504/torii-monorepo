import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@server/shared';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';
import { QuestionBankController } from './interfaces/nats/question-bank.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    QuestionBankModule,
  ],
  controllers: [QuestionBankController],
  providers: [],
})
export class AssessmentModule { }
