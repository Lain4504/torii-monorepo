import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { JwtTokenProvider } from './providers/jwt-token.provider';

import { RedisModule } from './redis/redis.module';
import { EncryptionModule } from './encryption/encryption.module';
import { SharedStorageModule } from './storage/shared-storage.module';
import { SharedEmailModule } from './email/shared-email.module';

@Global()
@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        RedisModule,
        EncryptionModule,
        SharedStorageModule,
        SharedEmailModule
    ],
    providers: [PrismaService, JwtTokenProvider],
    exports: [
        PrismaService,
        PrismaModule,
        ConfigModule,
        JwtTokenProvider,
        RedisModule,
        EncryptionModule,
        SharedStorageModule,
        SharedEmailModule
    ],
})
export class SharedModule { }

