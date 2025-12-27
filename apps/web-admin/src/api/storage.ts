import { apiClient } from './client';
import { PresignedUploadUrlRequest, PresignedUploadUrlResponse, ConfirmUploadRequest, ConfirmUploadResponse } from '@workspace/dtos';

// ============================================================================
// API Functions
// ============================================================================

export const storageApi = {
    // POST /api/storage/upload-url
    async generateUploadUrl(data: PresignedUploadUrlRequest): Promise<PresignedUploadUrlResponse> {
        const response = await apiClient.post<PresignedUploadUrlResponse>('/api/storage/upload-url', data);
        return response.data;
    },

    // POST /api/storage/confirm
    async confirmUpload(data: ConfirmUploadRequest): Promise<ConfirmUploadResponse> {
        const response = await apiClient.post<ConfirmUploadResponse>('/api/storage/confirm', data);
        return response.data;
    },
};
