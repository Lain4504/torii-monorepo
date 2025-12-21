import { Injectable, Logger } from '@nestjs/common';
import { RoomService } from './room.service';

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);

    constructor(
        private readonly roomService: RoomService,
    ) { }

    async convertWhiteboardFile(data: { roomId: string; fileId: string }) {
        this.logger.log(`Convert Whiteboard File for ${data.roomId}`);
        // TODO: Implement whiteboard file conversion logic
        return { status: true, msg: 'success' };
    }

    async getRoomFilesByType(data: { roomId: string; fileType: number }) {
        return this.roomService.getRoomFilesByType(data);
    }
}
