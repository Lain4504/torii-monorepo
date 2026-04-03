import { Module } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { RoadmapHandler } from './roadmap.handler';

@Module({
  providers: [RoadmapService],
  controllers: [RoadmapHandler],
  exports: [RoadmapService],
})
export class RoadmapModule {}

