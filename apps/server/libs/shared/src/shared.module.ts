import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { JwtTokenProvider } from './providers/jwt-token.provider';
//NatsAuthService moved to separate NatsAuthModule to prevent multiple instances

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, JwtTokenProvider],
  exports: [
    PrismaService,
    ConfigModule,
    JwtTokenProvider,
  ],
})
export class SharedModule { }
