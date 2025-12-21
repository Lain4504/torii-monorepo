import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthService } from './services/auth.service';
import { LiveKitService } from './services/livekit.service';
import { RedisService } from './services/redis.service';
import { NatsService } from './nats/nats.service';
//NatsAuthService moved to separate NatsAuthModule to prevent multiple instances

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, AuthService, LiveKitService, RedisService, NatsService],
  exports: [
    PrismaService,
    AuthService,
    LiveKitService,
    RedisService,
    NatsService,
    ConfigModule,
  ],
})
export class SharedModule { }
