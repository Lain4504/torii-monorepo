import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { JwtTokenProvider } from './providers/jwt-token.provider';
import { AuditLogService } from './audit/audit-log.service';
//NatsAuthService moved to separate NatsAuthModule to prevent multiple instances

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, JwtTokenProvider, AuditLogService],
  exports: [
    PrismaService,
    ConfigModule,
    JwtTokenProvider,
    AuditLogService,
  ],
})
export class SharedModule { }
