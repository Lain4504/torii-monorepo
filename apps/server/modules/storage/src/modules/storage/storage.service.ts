import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { SharedStorageService } from '@server/shared/storage/shared-storage.service';
import {
    StoragePresignedUrlRequestDTO,
    StoragePresignedUrlResponseDTO,
    StorageConfirmUploadRequestDTO,
    StorageConfirmUploadResponseDTO,
    StorageDeleteFileRequestDTO,
    StorageDeleteFileResponseDTO,
    StorageGetSignedUrlRequestDTO,
    StorageGetSignedUrlResponseDTO,
} from '@workspace/schemas';
import { v4 as uuidv4 } from 'uuid';
import type { IStorageRepository } from '../../interfaces/repositories/i-storage.repository';
import { STORAGE_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-storage.repository';
import type { IStorageService } from '../../interfaces/services/i-storage.service';

@Injectable()
export class StorageService implements IStorageService {
    private readonly logger = new Logger(StorageService.name);

    constructor(
        private readonly sharedStorage: SharedStorageService,
        @Inject(STORAGE_REPOSITORY_TOKEN)
        private readonly storageRepository: IStorageRepository,
    ) { }

    /**
     * Generate a presigned URL for direct client-side upload
     */
    async generatePresignedUploadUrl(data: StoragePresignedUrlRequestDTO): Promise<StoragePresignedUrlResponseDTO> {
        // 1. Generate a unique key for the file
        const fileId = uuidv4();
        const extension = data.filename.split('.').pop() || '';
        const key = `uploads/${data.module}/${fileId}${extension ? '.' + extension : ''}`;

        // 2. Create a pending record in the database
        await this.storageRepository.create({
            id: fileId,
            fileUrl: key,
            mimeType: data.contentType,
            status: 'pending',
            ownerId: data.ownerId,
            metadata: data.metadata || {},
            moduleOrigin: data.module.toUpperCase(),
            isPublic: false,
        });

        // 3. Generate presigned URL from S3/R2
        const uploadUrl = await this.sharedStorage.generatePresignedUploadUrl(key, data.contentType);

        // 4. Return info
        const publicUrl = this.sharedStorage.getPublicUrl(key);

        await this.storageRepository.update(fileId, { fileUrl: publicUrl });

        return {
            uploadUrl,
            fileId,
            fileUrl: publicUrl,
            expiresIn: 3600,
        };
    }

    /**
     * Confirm that a file has been uploaded
     */
    async confirmUpload(data: StorageConfirmUploadRequestDTO): Promise<StorageConfirmUploadResponseDTO> {
        const fileAsset = await this.storageRepository.findById(data.fileId);

        if (!fileAsset) {
            throw new NotFoundException('File asset not found');
        }

        // Extract key from URL
        let key = fileAsset.fileUrl;
        try {
            if (key.startsWith('http')) {
                key = this.sharedStorage.extractKeyFromUrl(key);
            }
        } catch {
            this.logger.warn(`Could not extract key from ${key}, assuming it is the key`);
        }

        // Verify existence in S3
        const exists = await this.sharedStorage.exists(key);
        if (!exists) {
            throw new BadRequestException('File not found in storage. Upload might have failed.');
        }

        // Update status
        const updated = await this.storageRepository.update(data.fileId, { status: 'uploaded' });

        return {
            success: true,
            fileId: updated.id,
            fileUrl: updated.fileUrl,
        };
    }


    /**
     * Delete a file
     */
    async deleteFile(data: StorageDeleteFileRequestDTO): Promise<StorageDeleteFileResponseDTO> {
        const fileAsset = await this.storageRepository.findById(data.fileId);

        if (!fileAsset) {
            throw new NotFoundException('File asset not found');
        }

        let key = fileAsset.fileUrl;
        try {
            if (key.startsWith('http')) {
                key = this.sharedStorage.extractKeyFromUrl(key);
            }
        } catch {
            this.logger.warn(`Could not extract key from ${key}, assuming it is the key`);
        }

        await this.sharedStorage.delete(key);

        await this.storageRepository.delete(data.fileId);

        return {
            success: true,
            message: 'File deleted successfully',
        };
    }

    /**
     * Get a temporary signed URL for viewing a private file
     */
    async getSignedUrl(data: StorageGetSignedUrlRequestDTO): Promise<StorageGetSignedUrlResponseDTO> {
        const fileAsset = await this.storageRepository.findById(data.fileId);

        if (!fileAsset) {
            throw new NotFoundException('File asset not found');
        }

        let key = fileAsset.fileUrl;
        try {
            if (key.startsWith('http')) {
                key = this.sharedStorage.extractKeyFromUrl(key);
            }
        } catch { }

        const signedUrl = await this.sharedStorage.getPresignedUrl({
            key,
            expiresIn: data.expiresIn || 3600,
        });

        return {
            fileId: data.fileId,
            signedUrl,
            expiresIn: data.expiresIn || 3600,
        };
    }
}
