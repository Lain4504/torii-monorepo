import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { LiveKitService } from './services/livekit.service';
import { RedisService } from './services/redis.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [PrismaService, LiveKitService, RedisService],
    exports: [PrismaService, LiveKitService, RedisService],
})
export class SharedModule { }
