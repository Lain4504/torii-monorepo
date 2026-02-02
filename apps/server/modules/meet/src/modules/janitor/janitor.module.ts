import { Module, forwardRef } from '@nestjs/common';
import { JanitorService } from './janitor.service';
import { JanitorRoomService } from './janitor-room.service';
import { JanitorUserService } from './janitor-user.service';
import { JanitorFilesystemService } from './janitor-filesystem.service';
import { NatsModule } from '../../interfaces/nats/nats.module';
import { RoomModule } from '../room/room.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { LiveKitModule } from '../../infrastructure/livekit/livekit.module';
import { PrismaModule } from '@server/shared';

@Module({
    imports: [
        PrismaModule,
        RedisModule,
        forwardRef(() => NatsModule),
        forwardRef(() => RoomModule),
        LiveKitModule,
    ],
    providers: [
        JanitorService,
        JanitorRoomService,
        JanitorUserService,
        JanitorFilesystemService,
    ],
    exports: [JanitorService],
})
export class JanitorModule { }
