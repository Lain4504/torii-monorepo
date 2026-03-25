import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { GameV2IngestorService } from './game-v2-ingestor.service';

@Controller()
export class GameV2ActivityListener {
  private readonly logger = new Logger(GameV2ActivityListener.name);

  constructor(private readonly ingestor: GameV2IngestorService) {}

  @EventPattern('user.activity')
  async onUserActivity(
    @Payload()
    data: {
      userId: string;
      activityType: string;
      meta?: Record<string, unknown>;
      timestamp?: string;
    },
  ) {
    if (!data?.userId || !data?.activityType) return;
    try {
      return await this.ingestor.ingestActivity({
        userId: data.userId,
        activityType: data.activityType,
        meta: data.meta ?? {},
        eventTime: data.timestamp,
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(
        `game-v2 ingest failed userId=${data.userId}: ${err.message}`,
        err.stack,
      );
      return;
    }
  }

  // Future internal use (HTTP gateway skeleton can forward here later)
  @MessagePattern('internal.game.ingest-activity')
  async onInternalIngest(
    @Payload()
    data: {
      userId: string;
      activityType: string;
      meta?: Record<string, unknown>;
      eventTime?: string;
    },
  ) {
    if (!data?.userId || !data?.activityType) return { ok: false };
    return this.ingestor.ingestActivity({
      userId: data.userId,
      activityType: data.activityType,
      meta: data.meta ?? {},
      eventTime: data.eventTime,
    });
  }
}

