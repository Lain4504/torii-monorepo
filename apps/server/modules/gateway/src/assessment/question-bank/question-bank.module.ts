import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { QuestionBankController } from './question-bank.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [QuestionBankController],
})
export class QuestionBankModule {}
