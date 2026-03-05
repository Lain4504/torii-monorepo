import { Module } from '@nestjs/common';
import { AttendanceHandler } from '@server/learning/modules/attendance/attendance.handler';
import { PrismaService } from '@server/shared';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceProfile } from '@server/learning/infrastructure/mappings/attendance.profile';
import { ATTENDANCE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { ATTENDANCE_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';

@Module({
  controllers: [AttendanceHandler],
  providers: [
    {
      provide: ATTENDANCE_SERVICE_TOKEN,
      useClass: AttendanceService,
    },
    {
      provide: ATTENDANCE_REPOSITORY_TOKEN,
      useClass: AttendanceRepository,
    },
    AttendanceProfile,
    PrismaService,
  ],
  exports: [ATTENDANCE_SERVICE_TOKEN],
})
export class AttendanceModule {}
