import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AcademyCronService } from './academy-cron.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [AcademyCronService],
})
export class InfrastructureModule { }
