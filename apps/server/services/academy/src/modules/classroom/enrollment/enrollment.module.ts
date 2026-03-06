import { Module } from '@nestjs/common';
import { EnrollmentHandler } from './enrollment.handler';
import { EnrollmentService } from './enrollment.service';

@Module({
  providers: [EnrollmentService],
  controllers: [EnrollmentHandler],
  exports: [EnrollmentService],
})
export class EnrollmentModule { }

