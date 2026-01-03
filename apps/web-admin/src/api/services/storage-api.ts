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
        const response = await apiClient.post<StorageConfirmUploadResponseDTO>('/api/storage/confirm', data);
        return response.data;
    },
};
