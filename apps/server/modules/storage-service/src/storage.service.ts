import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '@server/shared';
import { PrismaService } from '@server/shared';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

export interface PresignedUploadUrlRequest {
  filename: string;
  contentType: string;
  module: string;
  ownerId?: string;
  metadata?: Record<string, any>;
}

export interface PresignedUploadUrlResponse {
  uploadUrl: string;
  fileId: string;
  fileKey: string;
  expiresIn: number;
  supabaseUrl?: string;
  bucketName?: string;
}

export interface ConfirmUploadRequest {
  fileId: string;
}

export interface ConfirmUploadResponse {
  success: boolean;
  fileId: string;
  fileUrl: string;
}

export interface DeleteFileRequest {
  fileId: string;
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
}

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
        const { data, error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: false, // Private bucket by default
          fileSizeLimit: 52428800, // 50MB default
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
      // Don't throw - allow service to start even if bucket check fails
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
      if (ownerId) {
        // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(ownerId)) {
          this.logger.warn(`Invalid UUID format for ownerId: ${ownerId}. Setting to null.`);
          ownerId = null;
        }
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

      // Generate unique file key based on module
      const fileExtension = extname(filename);
      const uniqueId = uuidv4();
      const fileKey = this.generateFileKey(module, uniqueId, fileExtension);

      // Create file record in database with PENDING status
      const fileAsset = await this.prisma.fileAsset.create({
        data: {
          fileName: filename,
          fileKey: fileKey,
          bucketName: this.bucketName,
          provider: 'SUPABASE_STORAGE',
          mimeType: contentType,
          ownerId: ownerId || null, // Set to null if undefined or invalid UUID
          moduleOrigin: module,
          status: 'PENDING',
          metadata: metadata,
        },
      });

      // Generate presigned upload URL for Supabase Storage
      // Supabase Storage supports createSignedUploadUrl (similar to S3 presigned URLs)
      const expiresIn = 3600; // 1 hour
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      
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

      this.logger.log(`Generated signed upload URL for file ${fileAsset.id}: ${fileKey}`);

      return {
        uploadUrl: uploadUrl,
        fileId: fileAsset.id,
        fileKey: fileKey,
        expiresIn: expiresIn,
        supabaseUrl: supabaseUrl,
        bucketName: this.bucketName,
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

      if (fileAsset.status === 'UPLOADED') {
        // Already confirmed
        const fileUrl = await this.getFileUrl(fileAsset.fileKey, fileAsset.isPublic);
        return {
          success: true,
          fileId: fileAsset.id,
          fileUrl: fileUrl,
        };
      }

      // Verify file exists in Supabase Storage
      // Split fileKey to get path and filename
      const pathParts = fileAsset.fileKey.split('/');
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
        // If listing fails, try to get public URL as alternative check
        // (this will fail if file doesn't exist)
        const { data: publicUrlData } = this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(fileAsset.fileKey);
        
        // If we can't verify, we'll still allow the confirmation
        // but log a warning
        this.logger.warn(`Could not verify file existence, proceeding with confirmation`);
      } else {
        const fileExists = files?.some((file) => file.name === fileName);
        if (!fileExists) {
          this.logger.warn(`File ${fileAsset.fileKey} not found in storage`);
          throw new Error(`File not found in storage: ${fileAsset.fileKey}`);
        }
      }

      // Get file info if available
      const fileInfo = files?.find((file) => file.name === fileName);

      // Get actual file size and metadata from storage
      // Note: Supabase Storage API might not expose size in list, so we'll try to get signed URL
      const fileUrl = await this.getFileUrl(fileAsset.fileKey, fileAsset.isPublic);

      // Update file record status to UPLOADED
      // Note: Supabase Storage list API doesn't always return file size in metadata
      // If we need accurate size, we might need to make a HEAD request or use a different approach
      const updatedFileAsset = await this.prisma.fileAsset.update({
        where: { id: fileId },
        data: {
          status: 'UPLOADED',
          // fileSize will remain as set during upload confirmation if provided
        },
      });

      this.logger.log(`Confirmed upload for file ${fileId}: ${fileAsset.fileKey}`);

      return {
        success: true,
        fileId: updatedFileAsset.id,
        fileUrl: fileUrl,
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

      // Delete from Supabase Storage
      const { error: deleteError } = await this.supabase.storage
        .from(this.bucketName)
        .remove([fileAsset.fileKey]);

      if (deleteError) {
        this.logger.warn(`Failed to delete file from storage: ${deleteError.message}`);
        // Continue to update database even if storage deletion fails
      }

      // Update file record status to DELETED (soft delete) or actually delete
      await this.prisma.fileAsset.update({
        where: { id: fileId },
        data: {
          status: 'DELETED',
        },
      });

      this.logger.log(`Deleted file ${fileId}: ${fileAsset.fileKey}`);

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
   * Get public or signed URL for file
   */
  private async getFileUrl(fileKey: string, isPublic: boolean): Promise<string> {
    if (isPublic) {
      // Public URL
      const { data } = this.supabase.storage.from(this.bucketName).getPublicUrl(fileKey);
      return data.publicUrl;
    } else {
      // Signed URL (expires in 1 hour)
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(fileKey, 3600);

      if (error) {
        throw new Error(`Failed to generate signed URL: ${error.message}`);
      }

      return data.signedUrl;
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
}

