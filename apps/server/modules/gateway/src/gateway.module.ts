import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { CourseModule } from './course/course.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule, NatsAuthModule, NatsClientModule } from '@server/shared';
import { RoomModule } from './room/room.module';
import { AdminModule } from './admin/admin.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { FlashcardDeckModule } from './flashcard-deck/flashcard-deck.module';
import { StorageModule } from './storage/storage.module';
import { BlogModule } from './blog/blog.module';
import { NotificationModule } from './notification/notification.module';
import { QuestionBankModule } from './question-bank/question-bank.module';

import { GatewayController } from './gateway.controller';
import { ApiKeyGuard } from '@server/shared/guards/api-key.guard';

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

    NatsClientModule, // Add NATS client for GatewayService
    AuthModule,
    FlashcardModule,
    FlashcardDeckModule,
    CourseModule,
    SharedModule,
    NatsAuthModule, // Auth callout handler - only in Gateway
    RoomModule,
    AdminModule,
    StorageModule,
    BlogModule,
    QuestionBankModule,
    NotificationModule,
  ],
  controllers: [GatewayController],
  providers: [
    ApiKeyGuard,
  ],
  exports: [],
})
export class GatewayModule { }

