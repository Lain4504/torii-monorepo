import { Module } from '@nestjs/common';
import { NatsAuthService } from './nats-auth.service';
import { NatsService } from './nats.service';
import { ConfigModule } from '@nestjs/config';

/**
 * NatsAuthModule - Only import this in Gateway service
 * This ensures auth callout handler runs on a single instance
 */
@Module({
  imports: [ConfigModule],
  providers: [NatsAuthService],
  exports: [NatsAuthService],
})
export class NatsAuthModule {}
