import { Module } from '@nestjs/common';
import { ClassHandler } from './class.handler';
import { ClassService } from './class.service';

@Module({
  providers: [ClassService],
  controllers: [ClassHandler],
})
export class ClassModule {}

