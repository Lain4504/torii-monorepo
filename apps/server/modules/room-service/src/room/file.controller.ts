import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileService } from './file.service';

@Controller()
export class FileController {
    constructor(
        private readonly fileService: FileService,
    ) { }

    @MessagePattern({ cmd: 'file.convertWhiteboardFile' })
    async convertWhiteboardFile(@Payload() data: { roomId: string; fileId: string }) {
        return this.fileService.convertWhiteboardFile(data);
    }

    @MessagePattern({ cmd: 'file.getRoomFilesByType' })
    async getRoomFilesByType(@Payload() data: { roomId: string; fileType: number }) {
        return this.fileService.getRoomFilesByType(data);
    }
}
