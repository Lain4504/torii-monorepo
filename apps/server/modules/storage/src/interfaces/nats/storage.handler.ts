import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { STORAGE_SERVICE_TOKEN, IStorageService } from '../../interfaces/services/i-storage.service';
import { STORAGE_REPOSITORY_TOKEN, IStorageRepository } from '../../interfaces/repositories/i-storage.repository';
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
        @Inject(STORAGE_REPOSITORY_TOKEN)
        private readonly storageRepository: IStorageRepository,
    ) { }

    @MessagePattern({ cmd: 'storage.generatePresignedUploadUrl' })
    async generatePresignedUploadUrl(@Payload() data: StoragePresignedUrlRequestDTO) {
        return this.storageService.generatePresignedUploadUrl(data);
    }

    @MessagePattern({ cmd: 'storage.confirmUpload' })
    async confirmUpload(@Payload() data: StorageConfirmUploadRequestDTO) {
        return this.storageService.confirmUpload(data);
    }

    @MessagePattern({ cmd: 'storage.deleteFile' })
    async deleteFile(@Payload() data: StorageDeleteFileRequestDTO) {
        return this.storageService.deleteFile(data);
    }

    @MessagePattern({ cmd: 'storage.getSignedUrl' })
    async getSignedUrl(@Payload() data: StorageGetSignedUrlRequestDTO) {
        return this.storageService.getSignedUrl(data);
    }

    @MessagePattern({ cmd: 'storage.findById' })
    async findById(@Payload() data: { fileId: string }) {
        return this.storageRepository.findById(data.fileId);
    }
}
