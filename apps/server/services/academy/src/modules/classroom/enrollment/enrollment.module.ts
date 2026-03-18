import { Module } from '@nestjs/common';
import { EnrollmentHandler } from './enrollment.handler';
import { EnrollmentService } from './enrollment.service';
import { GamificationModule } from '../../gamification/gamification.module';

@Module({
  imports: [GamificationModule],
  providers: [EnrollmentService],
  controllers: [EnrollmentHandler],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
