import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { LiveKitService } from './services/livekit.service';
import { RedisService } from './services/redis.service';
import { NatsService } from './nats/nats.service';
// NatsAuthService moved to separate NatsAuthModule to prevent multiple instances

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, LiveKitService, RedisService, NatsService],
  exports: [PrismaService, LiveKitService, RedisService, NatsService, ConfigModule],
})
export class SharedModule { }
