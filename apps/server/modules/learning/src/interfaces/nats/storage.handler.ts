import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { STORAGE_SERVICE_TOKEN, IStorageService } from '../../interfaces/services/i-storage.service';
import {
    StoragePresignedUrlRequestDTO,
    StorageConfirmUploadRequestDTO,
    StorageDeleteFileRequestDTO,
    StorageGetSignedUrlRequestDTO
} from '@workspace/schemas';

@Controller()
export class StorageHandler {
    constructor(
        @Inject(STORAGE_SERVICE_TOKEN)
        private readonly storageService: IStorageService,
    ) { }

    @MessagePattern({ cmd: 'learning.storage.generatePresignedUploadUrl' })
    async generatePresignedUploadUrl(@Payload() data: StoragePresignedUrlRequestDTO) {
        return this.storageService.generatePresignedUploadUrl(data);
    }

    @MessagePattern({ cmd: 'learning.storage.confirmUpload' })
    async confirmUpload(@Payload() data: StorageConfirmUploadRequestDTO) {
        return this.storageService.confirmUpload(data);
    }

    @MessagePattern({ cmd: 'learning.storage.deleteFile' })
    async deleteFile(@Payload() data: StorageDeleteFileRequestDTO) {
        return this.storageService.deleteFile(data);
    }

    @MessagePattern({ cmd: 'learning.storage.getSignedUrl' })
    async getSignedUrl(@Payload() data: StorageGetSignedUrlRequestDTO) {
        return this.storageService.getSignedUrl(data);
    }

    @MessagePattern({ cmd: 'learning.storage.directUpload' })
    async directUpload(@Payload() data: {
        filename: string,
        contentType: string,
        module: string,
        ownerId: string,
        metadata: any,
        file: { buffer: any }
    }) {
        // file.buffer comes as { type: 'Buffer', data: [...] } from NATS if not handled, or just Buffer.
        // NestJS Microservices usually serializes Buffer/Uint8Array.
        // We might need to reconstruct Buffer if it's sent as serializable object.
        // Assuming the service handles Buffer or standard input.
        // The original controller passed `file: file.buffer`.

        return this.storageService.directUpload({
            filename: data.filename,
            contentType: data.contentType,
            module: data.module || 'general',
            ownerId: data.ownerId,
            metadata: data.metadata || {},
            fileData: '',
            file: Buffer.from(data.file.buffer), // Reconstruct buffer from received data
        });
    }
}
