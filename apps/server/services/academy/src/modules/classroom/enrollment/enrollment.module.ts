import { Module } from '@nestjs/common';
import { EnrollmentHandler } from './enrollment.handler';
import { EnrollmentService } from './enrollment.service';
import { PrismaModule } from '@server/shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EnrollmentService],
  controllers: [EnrollmentHandler],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
