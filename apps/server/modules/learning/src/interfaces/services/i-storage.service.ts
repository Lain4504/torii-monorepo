import type {
    StoragePresignedUrlRequestDTO,
    StoragePresignedUrlResponseDTO,
    StorageConfirmUploadRequestDTO,
    StorageConfirmUploadResponseDTO,
    StorageDirectUploadRequestDTO,
    StorageDirectUploadResponseDTO,
    StorageDeleteFileRequestDTO,
    StorageDeleteFileResponseDTO,
    StorageGetSignedUrlRequestDTO,
    StorageGetSignedUrlResponseDTO,
} from '@workspace/schemas';

/**
 * Storage Service Interface
 * Defines the contract for storage business logic operations
 */
export interface IStorageService {
    /**
     * Generate a presigned URL for direct client-side upload
     */
    generatePresignedUploadUrl(data: StoragePresignedUrlRequestDTO): Promise<StoragePresignedUrlResponseDTO>;

    /**
     * Confirm that a file has been uploaded
     */
    confirmUpload(data: StorageConfirmUploadRequestDTO): Promise<StorageConfirmUploadResponseDTO>;

    /**
     * Direct upload (small files passed as buffer)
     */
    directUpload(data: StorageDirectUploadRequestDTO & { file?: Buffer }): Promise<StorageDirectUploadResponseDTO>;

    /**
     * Delete a file
     */
    deleteFile(data: StorageDeleteFileRequestDTO): Promise<StorageDeleteFileResponseDTO>;

    /**
     * Get a temporary signed URL for viewing a private file
     */
    getSignedUrl(data: StorageGetSignedUrlRequestDTO): Promise<StorageGetSignedUrlResponseDTO>;
}

export const STORAGE_SERVICE_TOKEN = Symbol('STORAGE_SERVICE');

