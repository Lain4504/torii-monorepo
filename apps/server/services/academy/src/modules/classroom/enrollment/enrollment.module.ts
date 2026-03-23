import { Module } from '@nestjs/common';
import { EnrollmentHandler } from './enrollment.handler';
import { EnrollmentService } from './enrollment.service';
import { GamificationModule } from '../../gamification/gamification.module';
import { ClassModule } from '../class/class.module';

@Module({
  imports: [GamificationModule, ClassModule],
  providers: [EnrollmentService],
  controllers: [EnrollmentHandler],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
