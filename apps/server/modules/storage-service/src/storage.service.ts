import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '@server/shared';
import { PrismaService } from '@server/shared';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import { extname } from 'path';
import {
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  DeleteFileRequest,
  DeleteFileResponse,
  VideoMetadata,
} from '@workspace/dtos';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName: string;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('SUPABASE_STORAGE_BUCKET') || 'file-assets';
    // Ensure bucket exists on service initialization
    this.ensureBucketExists().catch((error) => {
      this.logger.warn(`Failed to ensure bucket exists: ${error.message}`);
    });
  }

  /**
   * Ensure bucket exists, create if it doesn't
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists by trying to list it
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
      
      if (listError) {
        this.logger.error(`Failed to list buckets: ${listError.message}`);
        return;
      }

      const bucketExists = buckets?.some((bucket) => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        this.logger.log(`Bucket '${this.bucketName}' does not exist. Creating...`);
        
        // Create bucket
        // No file size limit to support video uploads without restrictions
        const { data, error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: false, // Private bucket by default
          fileSizeLimit: null, // No limit - supports unlimited video uploads
          allowedMimeTypes: null, // Allow all file types
        });

        if (createError) {
          this.logger.error(`Failed to create bucket '${this.bucketName}': ${createError.message}`);
          throw new Error(`Bucket '${this.bucketName}' does not exist and could not be created: ${createError.message}. Please create it manually in Supabase Dashboard.`);
        }

        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      } else {
        this.logger.debug(`Bucket '${this.bucketName}' already exists`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${error.message}`);
    }
  }

  /**
   * Generate presigned upload URL for Supabase Storage
   */
  async generatePresignedUploadUrl(
    request: PresignedUploadUrlRequest,
  ): Promise<PresignedUploadUrlResponse> {
    try {
      // Log received data for debugging
      this.logger.debug(`Request received: ${JSON.stringify(request)}`);
      
      // Extract fields (handle both camelCase and snake_case variants)
      const filename = request.filename || (request as any).fileName || (request as any).file_name;
      const contentType = request.contentType || (request as any).contentType || (request as any).content_type || (request as any).mimeType;
      const module = request.module;
      let ownerId = request.ownerId || (request as any).ownerId || (request as any).owner_id;
      const metadata = request.metadata || (request as any).metadata || {};

      // Validate ownerId - must be valid UUID or null/undefined
      if (ownerId && !validateUuid(ownerId)) {
        this.logger.warn(`Invalid UUID format for ownerId: ${ownerId}. Setting to null.`);
        ownerId = null;
      }

      this.logger.debug(`Extracted - filename: ${filename}, contentType: ${contentType}, module: ${module}, ownerId: ${ownerId || 'null'}`);

      // Validate required fields
      if (!filename || typeof filename !== 'string') {
        throw new Error('filename is required and must be a string. Received: ' + JSON.stringify(request));
      }
      if (!contentType || typeof contentType !== 'string') {
        throw new Error('contentType is required and must be a string. Received: ' + JSON.stringify(request));
      }
      if (!module || typeof module !== 'string') {
        throw new Error('module is required and must be a string. Received: ' + JSON.stringify(request));
      }

      // Configuration
      const expiresIn = 3600; // 1 hour
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');

      // Generate unique file key based on module
      const fileExtension = extname(filename);
      const uniqueId = uuidv4();
      const fileKey = this.generateFileKey(module, uniqueId, fileExtension);

      // Prepare metadata - if video file, merge with video metadata structure
      let finalMetadata = { ...metadata };
      if (this.isVideoFile(contentType)) {
        const videoMetadataStructure = this.getVideoMetadataStructure();
        finalMetadata = {
          ...videoMetadataStructure,
          ...metadata, // User-provided metadata takes precedence
        };
        this.logger.debug(`Video file detected, metadata structure initialized`);
      }

      // Ensure bucket exists before generating upload URL
      await this.ensureBucketExists();

      // Create signed upload URL using Supabase Storage API
      // This returns a token that can be used for direct client upload
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUploadUrl(fileKey, {
          upsert: false, // Don't overwrite existing files
        });

      if (uploadError) {
        this.logger.error(`Failed to generate signed upload URL: ${uploadError.message}`);
        
        // Provide helpful error message if bucket doesn't exist
        if (uploadError.message.includes('does not exist') || uploadError.message.includes('related resource')) {
          throw new Error(
            `Bucket '${this.bucketName}' does not exist in Supabase Storage. ` +
            `Please create it in Supabase Dashboard: Storage → New Bucket → Name: '${this.bucketName}'`
          );
        }
        
        throw new Error(`Failed to generate signed upload URL: ${uploadError.message}`);
      }

      // Construct the full upload URL with token
      // Format: {supabaseUrl}/storage/v1/object/{bucket}/{fileKey}?token={token}
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${this.bucketName}/${fileKey}?token=${uploadData.token}`;

      // Generate file URL (public or signed URL) for accessing the file
      // For now, use public URL structure (will be updated after upload confirmation)
      const fileUrl = `${supabaseUrl}/storage/v1/object/public/${this.bucketName}/${fileKey}`;

      // Prepare file asset data
      const fileAssetData = {
        fileUrl: fileUrl,
        mimeType: contentType,
        ownerId: ownerId || null, // Set to null if undefined or invalid UUID
        moduleOrigin: module,
        metadata: finalMetadata,
      };

      // Create file record in database
      const fileAsset = await this.prisma.fileAsset.create({
        data: fileAssetData,
      });

      this.logger.log(`Generated signed upload URL for file ${fileAsset.id}: ${fileKey}`);

      return {
        uploadUrl: uploadUrl,
        fileId: fileAsset.id,
        fileUrl: fileAsset.fileUrl,
        expiresIn: expiresIn,
        supabaseUrl: supabaseUrl,
      };
    } catch (error) {
      this.logger.error(`Error generating presigned URL: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Confirm file upload and verify file exists in storage
   */
  async confirmUpload(request: ConfirmUploadRequest): Promise<ConfirmUploadResponse> {
    try {
      const { fileId } = request;

      // Find file record
      const fileAsset = await this.prisma.fileAsset.findUnique({
        where: { id: fileId },
      });

      if (!fileAsset) {
        throw new Error(`File asset ${fileId} not found`);
      }

      // Extract file key from fileUrl for Supabase operations
      // fileUrl format: {supabaseUrl}/storage/v1/object/public/{bucket}/{key}
      const fileKey = this.extractKeyFromUrl(fileAsset.fileUrl);

      // Verify file exists in Supabase Storage
      // Split fileKey to get path and filename
      const pathParts = fileKey.split('/');
      const fileName = pathParts.pop() || '';
      const folderPath = pathParts.length > 0 ? pathParts.join('/') : '';

      // Try to list files in the folder to check if file exists
      const { data: files, error: listError } = await this.supabase.storage
        .from(this.bucketName)
        .list(folderPath, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (listError) {
        this.logger.warn(`Error listing files: ${listError.message}`);
        // If we can't verify, we'll still allow the confirmation
        // but log a warning
        this.logger.warn(`Could not verify file existence, proceeding with confirmation`);
      } else {
        const fileExists = files?.some((file) => file.name === fileName);
        if (!fileExists) {
          this.logger.warn(`File ${fileKey} not found in storage`);
          throw new Error(`File not found in storage: ${fileKey}`);
        }
      }

      // Get file info if available
      const fileInfo = files?.find((file) => file.name === fileName);

      // Update fileUrl if needed (generate signed URL if private)
      let finalFileUrl = fileAsset.fileUrl;
      if (!fileAsset.isPublic) {
        // Generate signed URL for private files
        const { data: signedUrlData, error: signedUrlError } = await this.supabase.storage
          .from(this.bucketName)
          .createSignedUrl(fileKey, 3600);
        
        if (!signedUrlError && signedUrlData) {
          finalFileUrl = signedUrlData.signedUrl;
        }
      }

      // Update fileUrl if needed
      const updatedFileAsset = await this.prisma.fileAsset.update({
        where: { id: fileId },
        data: {
          fileUrl: finalFileUrl,
        },
      });

      this.logger.log(`Confirmed upload for file ${fileId}: ${fileKey}`);

      return {
        success: true,
        fileId: updatedFileAsset.id,
        fileUrl: updatedFileAsset.fileUrl,
      };
    } catch (error) {
      this.logger.error(`Error confirming upload: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete file from storage and database
   */
  async deleteFile(request: DeleteFileRequest): Promise<DeleteFileResponse> {
    try {
      const { fileId } = request;

      // Find file record
      const fileAsset = await this.prisma.fileAsset.findUnique({
        where: { id: fileId },
      });

      if (!fileAsset) {
        throw new Error(`File asset ${fileId} not found`);
      }

      // Extract file key from fileUrl for Supabase operations
      const fileKey = this.extractKeyFromUrl(fileAsset.fileUrl);

      // Delete from Supabase Storage
      const { error: deleteError } = await this.supabase.storage
        .from(this.bucketName)
        .remove([fileKey]);

      if (deleteError) {
        this.logger.warn(`Failed to delete file from storage: ${deleteError.message}`);
        // Continue to delete from database even if storage deletion fails
      }

      // Delete file record from database
      await this.prisma.fileAsset.delete({
        where: { id: fileId },
      });

      this.logger.log(`Deleted file ${fileId}: ${fileKey}`);

      return {
        success: true,
        message: `File ${fileId} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate file key based on module and unique ID
   */
  private generateFileKey(module: string, uniqueId: string, extension: string): string {
    const timestamp = Date.now();
    const sanitizedModule = module.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitizedModule}/${timestamp}-${uniqueId}${extension}`;
  }

  /**
   * Extract file key from Supabase Storage URL
   * URL format: {supabaseUrl}/storage/v1/object/public/{bucket}/{key}
   * or: {supabaseUrl}/storage/v1/object/{bucket}/{key}?token=...
   */
  private extractKeyFromUrl(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      // Extract path after /object/public/ or /object/
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/(?:public\/)?[^/]+\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        return decodeURIComponent(pathMatch[1]);
      }
      throw new Error(`Invalid file URL format: ${fileUrl}`);
    } catch (error) {
      this.logger.error(`Failed to extract key from URL: ${fileUrl}`, error);
      throw new Error(`Invalid file URL format: ${fileUrl}`);
    }
  }

  /**
   * Check if file is a video based on MIME type
   */
  private isVideoFile(mimeType: string): boolean {
    return mimeType?.startsWith('video/') || false;
  }

  /**
   * Get video metadata structure for storage
   */
  private getVideoMetadataStructure(): Record<string, any> {
    return {
      type: 'video',
      duration: null, // in seconds
      width: null, // in pixels
      height: null, // in pixels
      codec: null, // video codec (e.g., 'h264', 'vp9')
      bitrate: null, // in bps
      fps: null, // frames per second
    };
  }
}

