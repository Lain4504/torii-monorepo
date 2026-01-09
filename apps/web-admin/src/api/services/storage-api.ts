import { apiClient } from '../api-client.ts';
import type { StoragePresignedUrlRequestDTO, StoragePresignedUrlResponseDTO, StorageConfirmUploadRequestDTO, StorageConfirmUploadResponseDTO } from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const storageApi = {
    // POST /api/storage/upload-url
    // POST /api/storage/upload-url
    async generateUploadUrl(data: StoragePresignedUrlRequestDTO): Promise<StoragePresignedUrlResponseDTO> {
        const response = await apiClient.post<StoragePresignedUrlResponseDTO>('/api/storage/upload-url', data);
        return response.data;
    },

    // POST /api/storage/confirm
    // POST /api/storage/confirm
    async confirmUpload(data: StorageConfirmUploadRequestDTO): Promise<StorageConfirmUploadResponseDTO> {
        const response = await apiClient.post<StorageConfirmUploadResponseDTO>('/api/storage/confirm-upload', data);
        return response.data;
    },
    // Helper: Upload file (Get URL -> Upload -> Confirm)
    async uploadFile(file: File, module: string = 'courses', metadata?: Record<string, any>, ownerId?: string): Promise<StorageConfirmUploadResponseDTO> {
        // 1. Get presigned URL
        const presignedData = await this.generateUploadUrl({
            contentType: file.type,
            filename: file.name,
            module,
            metadata,
            ownerId,
        });

        // 2. Upload file to signed URL
        await fetch(presignedData.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        // 3. Confirm upload
        return this.confirmUpload({
            fileId: presignedData.fileId,
        });
    },
};
