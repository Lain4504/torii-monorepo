import { Module } from '@nestjs/common';
import { JlptMockService } from './jlpt-mock.service';
import { JlptMockHandler } from './jlpt-mock.handler';

@Module({
  providers: [JlptMockService],
  controllers: [JlptMockHandler],
  exports: [JlptMockService],
})
export class JlptMockModule {}
