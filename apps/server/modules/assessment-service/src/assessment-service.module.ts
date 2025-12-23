import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@server/shared';
import { QuestionBankModule } from './question-bank/question-bank.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    QuestionBankModule,
  ],
  controllers: [],
  providers: [],
})
export class AssessmentServiceModule {}
