import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { JwtTokenProvider } from './providers/jwt-token.provider';
import { AuditLogService } from './audit/audit-log.service';
import { FirebaseAuthModule } from './firebase/firebase-auth.module';
//NatsAuthService moved to separate NatsAuthModule to prevent multiple instances

@Global()
@Module({
  imports: [ConfigModule, FirebaseAuthModule],
  providers: [PrismaService, JwtTokenProvider, AuditLogService],
  exports: [
    PrismaService,
    ConfigModule,
    JwtTokenProvider,
    AuditLogService,
    FirebaseAuthModule,
  ],
})
export class SharedModule { }
