import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
//NatsAuthService moved to separate NatsAuthModule to prevent multiple instances

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [
    PrismaService,
    ConfigModule,
  ],
})
export class SharedModule { }
