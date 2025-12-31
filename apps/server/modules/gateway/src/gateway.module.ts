import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { SharedModule, NatsAuthModule, NatsClientModule } from '@server/shared';
import { ApiKeyGuard } from '@server/shared/guards/api-key.guard';

// Proxy Module - Routes to microservices
import { ProxyModule } from './proxy/proxy.module';

// Keep gateway modules for services not yet migrated
import { LmsGatewayModule } from './lms/lms.module';
import { MeetGatewayModule } from './meet/meet.module';
import { FlashcardsGatewayModule } from './flashcards/flashcards.module';
import { CommunityGatewayModule } from './community/community.module';
import { AssessmentGatewayModule } from './assessment/assessment.module';
import { StorageGatewayModule } from './storage/storage-gateway.module';
import { CortexGatewayModule } from './cortex/cortex.module';
import { GamificationGatewayModule } from './gamification/gamification.module';

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
          stores: [new KeyvRedis(url)],
        };
      },
      inject: [ConfigService],
    }),

    NatsClientModule,
    SharedModule,
    NatsAuthModule, // Auth callout handler - only in Gateway

    // Proxy Module - Handles Identity routes
    ProxyModule,

    // Legacy Gateway Modules (to be migrated)
    LmsGatewayModule,
    MeetGatewayModule,
    FlashcardsGatewayModule,
    AssessmentGatewayModule,
    CommunityGatewayModule,
    StorageGatewayModule,
    CortexGatewayModule,
    GamificationGatewayModule,
  ],
  controllers: [],
  providers: [ApiKeyGuard],
  exports: [],
})
export class GatewayModule { }
