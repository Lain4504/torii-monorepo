import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { GameV2IngestorService } from './game-v2-ingestor.service';
import { GameV2ActivityListener } from './game-v2-activity.listener';

@Module({
  imports: [PrismaModule, NatsClientModule],
  providers: [GameV2IngestorService],
  controllers: [GameV2ActivityListener],
  exports: [GameV2IngestorService],
})
export class GamificationV2Module {}

