import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { JwtTokenProvider } from './providers/jwt-token.provider';
import { AuditLogService } from '@server/shared/audit';

import { RedisModule } from './redis/redis.module';

@Global()
@Module({
    imports: [ConfigModule, RedisModule],
    providers: [PrismaService, JwtTokenProvider, AuditLogService],
    exports: [
        PrismaService,
        ConfigModule,
        JwtTokenProvider,
        AuditLogService,
        RedisModule,
    ],
})
export class SharedModule { }
