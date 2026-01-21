import { Module, forwardRef } from '@nestjs/common';
import { RecordingService } from './recording.service';
import { RecordingNatsController } from './recording.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '../room/room.module';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => RoomModule), // RoomModule might need RecordingService or vice versa
    ],
    providers: [RecordingService, RecordingNatsController],
    controllers: [RecordingNatsController],
    exports: [RecordingService],
})
export class RecordingModule { }
