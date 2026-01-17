import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { SharedModule, NatsAuthModule, NatsClientModule } from '@server/shared';
import { ApiKeyGuard } from '@server/shared/guards/api-key.guard';

// Meet Module - Meet service routes via NATS
import { MeetModule } from './modules/meet/meet.module';
import { IdentityModule } from './modules/identity/identity.module';
import { LearningModule } from './modules/learning/learning.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { StorageModule } from './modules/storage/storage.module';
import { GamificationModule } from './modules/gamification/gamification.module';
// Agents Module - AI Agents Service via NATS
import { AgentsModule } from './modules/agents/agents.module';


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

    // AI Module - AI Agents Service
    // AiModule,

    // Agents Module - AI Agents Service via NATS
    AgentsModule,
    // Meet Module - Handles Meet service routes via NATS
    MeetModule,
    // Identity Module - Handles Identity service routes via NATS
    IdentityModule,
    // Learning Module - Handles Learning service routes via NATS
    LearningModule,
    // Communication Module
    CommunicationModule,
    // Storage Module
    StorageModule,
    // Gamification Module
    GamificationModule,
  ],
  controllers: [],
  providers: [ApiKeyGuard],
  exports: [],
})
export class GatewayModule { }
