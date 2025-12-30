import { Module } from '@nestjs/common';
import { QuestionBankModule } from './question-bank/question-bank.module';

@Module({
    imports: [
        QuestionBankModule,
    ],
})
export class AssessmentGatewayModule { }
