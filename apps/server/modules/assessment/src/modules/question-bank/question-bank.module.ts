import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { QuestionBankService } from './question-bank.service';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [QuestionBankService],
  exports: [QuestionBankService],
})
export class QuestionBankModule { }
