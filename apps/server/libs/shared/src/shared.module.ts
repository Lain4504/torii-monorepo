import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { LiveKitService } from './services/livekit.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [PrismaService, LiveKitService],
    exports: [PrismaService, LiveKitService],
})
export class SharedModule { }
