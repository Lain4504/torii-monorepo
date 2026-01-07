import { Injectable, Logger } from '@nestjs/common';
import { SharedStorageService } from '@server/shared';
import { IStorageService } from '../../interfaces/services/i-storage.service';

/**
 * Storage Service Implementation
 * Identity-specific storage logic for user profile pictures
 * Uses SharedStorageService for actual S3/R2 operations
 */
@Injectable()
export class StorageService implements IStorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly PROFILE_PICTURES_PREFIX = 'profile-pictures';

    constructor(private readonly sharedStorageService: SharedStorageService) { }

    /**
     * Upload profile picture
     */
    async uploadProfilePicture(
        userId: string,
        file: Buffer,
        mimeType: string
    ): Promise<string> {
        try {
            const fileExtension = mimeType.split('/')[1] || 'jpg';
            const key = `${this.PROFILE_PICTURES_PREFIX}/${userId}.${fileExtension}`;

            const url = await this.sharedStorageService.upload({
                key,
                file,
                contentType: mimeType,
                metadata: {
                    userId,
                    uploadedAt: new Date().toISOString(),
                    type: 'profile-picture',
                },
            });

            this.logger.log(`Profile picture uploaded for user ${userId}`);
            return url;
        } catch (error) {
            this.logger.error(`Failed to upload profile picture for user ${userId}:`, error);
            throw new Error('Failed to upload profile picture');
        }
    }

    /**
     * Delete profile picture
     */
    async deleteProfilePicture(userId: string): Promise<void> {
        try {
            // Try common image extensions
            const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

            for (const ext of extensions) {
                const key = `${this.PROFILE_PICTURES_PREFIX}/${userId}.${ext}`;

                // Check if file exists
                const exists = await this.sharedStorageService.exists(key);

                if (exists) {
                    // Delete the file
                    await this.sharedStorageService.delete(key);
                    this.logger.log(`Profile picture deleted for user ${userId}`);
                    return;
                }
            }

            this.logger.warn(`No profile picture found for user ${userId}`);
        } catch (error) {
            this.logger.error(`Failed to delete profile picture for user ${userId}:`, error);
            throw new Error('Failed to delete profile picture');
        }
    }

    /**
     * Get profile picture URL
     */
    async getProfilePictureUrl(userId: string): Promise<string | null> {
        try {
            // Try common image extensions
            const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

            for (const ext of extensions) {
                const key = `${this.PROFILE_PICTURES_PREFIX}/${userId}.${ext}`;

                // Check if file exists
                const exists = await this.sharedStorageService.exists(key);

                if (exists) {
                    // Generate presigned URL (valid for 7 days)
                    return await this.sharedStorageService.getPresignedUrl({
                        key,
                        expiresIn: 604800, // 7 days
                    });
                }
            }

            return null; // No profile picture found
        } catch (error) {
            this.logger.error(`Failed to get profile picture URL for user ${userId}:`, error);
            return null;
        }
    }
}
