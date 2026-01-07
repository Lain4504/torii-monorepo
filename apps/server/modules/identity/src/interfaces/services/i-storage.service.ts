/**
 * Storage Service Interface
 * Abstraction for file storage operations
 */
export interface IStorageService {
    /**
     * Upload profile picture
     * @param userId - The user's unique identifier
     * @param file - File buffer to upload
     * @param mimeType - MIME type of the file (e.g., 'image/jpeg')
     * @returns URL of the uploaded file
     * @throws Error if upload fails
     */
    uploadProfilePicture(userId: string, file: Buffer, mimeType: string): Promise<string>;

    /**
     * Delete profile picture
     * @param userId - The user's unique identifier
     * @throws Error if deletion fails
     */
    deleteProfilePicture(userId: string): Promise<void>;

    /**
     * Get profile picture URL
     * @param userId - The user's unique identifier
     * @returns URL of the profile picture or null if not found
     */
    getProfilePictureUrl(userId: string): Promise<string | null>;
}

/**
 * Storage Service Injection Token
 */
export const STORAGE_SERVICE_TOKEN = Symbol('STORAGE_SERVICE');
