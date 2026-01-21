import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsService } from '../../interfaces/nats/nats.service';
import { RoomMetadataSchema } from '@workspace/protocol';

@Injectable()
export class RecordingService {
    private readonly logger = new Logger(RecordingService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly natsRoomService: NatsRoomService,
        private readonly natsService: NatsService,
    ) { }

    /**
     * Get all active recorders/rooms that are recording
     */
    async getAllActiveRecorders(): Promise<string[]> {
        const rooms = await this.natsRoomService.getActiveRooms();
        const recordingRoomIds: string[] = [];

        for (const room of rooms) {
            try {
                // We need metadata to check if it's recording
                // NatsKvRoomInfo has metadata string
                const { metadata } = await this.natsRoomService.getRoomInfoWithMetadata(room.roomId);
                if (metadata && metadata.isRecording) {
                    recordingRoomIds.push(room.roomId);
                }
            } catch (e) {
                this.logger.warn(`Failed to check recording status for room ${room.roomId}: ${e.message}`);
            }
        }

        return recordingRoomIds;
    }
}
