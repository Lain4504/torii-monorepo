import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { SharedModule, NatsAuthModule, NatsClientModule } from '@server/shared';
import { RoomModule } from './room/room.module';
import { AdminModule } from './admin/admin.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { FlashcardDeckModule } from './flashcard-deck/flashcard-deck.module';
import { StorageModule } from './storage/storage.module';
import { BlogModule } from './blog/blog.module';
import { BlogCommentModule } from './blog-comment/blog-comment.module';
import { NotificationModule } from './notification/notification.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { WaitingRoomModule } from './waiting-room/waiting-room.module';
import { ModuleModule } from './module/module.module';
import { LessonModule } from './lesson/lesson.module';
import { AiModule } from './ai/ai.module';

import { GatewayController } from './gateway.controller';
import { ApiKeyGuard } from '@server/shared/guards/api-key.guard';

// Proxy Module - Routes to microservices
import { ProxyModule } from './proxy/proxy.module';

/**
 * API Gateway Module
 * Routes requests to microservices (HTTP proxy pattern)
 */
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST') || 'localhost';
        const port = configService.get('REDIS_PORT') || 6379;
        const password = configService.get('REDIS_PASSWORD');
        const url = `redis://${password ? `:${password}@` : ''}${host}:${port}`;
        return {
          stores: [
            new KeyvRedis(url),
          ],
        };
      },
      inject: [ConfigService],
    }),

    NatsClientModule,
    SharedModule,
    NatsAuthModule, // Auth callout handler - only in Gateway

    // Proxy Module - Handles all routes to microservices
    ProxyModule,
  ],
  exports: [],
})
export class GatewayModule { }
