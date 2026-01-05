import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { JwtTokenProvider } from './providers/jwt-token.provider';
import { AuditLogService } from '../../../modules/identity/src/modules/audit';
import { AuditLogRepository } from '../../../modules/identity/src/modules/audit';

import { RedisModule } from './redis/redis.module';

@Global()
@Module({
    imports: [ConfigModule, RedisModule],
    providers: [PrismaService, JwtTokenProvider, AuditLogService, AuditLogRepository],
    exports: [
        PrismaService,
        ConfigModule,
        JwtTokenProvider,
        AuditLogService,
        AuditLogRepository,
        RedisModule,
    ],
})
export class SharedModule { }
