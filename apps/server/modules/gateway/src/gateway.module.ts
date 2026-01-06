import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { SharedModule, NatsAuthModule, NatsClientModule } from '@server/shared';
import { ApiKeyGuard } from '@server/shared/guards/api-key.guard';

// Proxy Module - Routes to microservices
import { ProxyModule } from './proxy/proxy.module';
// AI Module - AI Agents Service
// import { AiModule } from './ai/ai.module';

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

    // Proxy Module - Handles all routes to microservices
    ProxyModule,
  ],
  controllers: [],
  providers: [ApiKeyGuard],
  exports: [],
})
export class GatewayModule { }
