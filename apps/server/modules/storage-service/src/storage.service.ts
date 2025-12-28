import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '@server/shared';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import { extname } from 'path';
import {
  StoragePresignedUrlRequestDTO,
  StoragePresignedUrlResponseDTO,
  StorageConfirmUploadRequestDTO,
  StorageConfirmUploadResponseDTO,
  StorageDeleteFileRequestDTO,
  StorageDeleteFileResponseDTO,
  StorageDirectUploadRequestDTO,
  StorageDirectUploadResponseDTO,
  StorageGetSignedUrlRequestDTO,
  StorageGetSignedUrlResponseDTO,
  FileStatus,
} from '@workspace/schemas';
import { R2_CLIENT } from './r2/r2.provider';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName: string;
  private readonly accountId: string;
  private readonly publicUrl: string;

  constructor(
    @Inject(R2_CLIENT) private readonly r2Client: S3Client,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || 'artworldstationtest';
    this.accountId = this.configService.get<string>('R2_ACCOUNT_ID') || '3e94e0d18dfd958011f6fb187dae9f1e';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') ||
      `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com`;
  }

  /**
   * Generate presigned upload URL for R2 Storage
   */
  async generatePresignedUploadUrl(
    request: StoragePresignedUrlRequestDTO,
  ): Promise<StoragePresignedUrlResponseDTO> {
    // Extract fields (DTOs already validated by class-validator)
    const { filename, contentType, module, metadata = {} } = request;
    let { ownerId } = request;

    // Validate ownerId - must be valid UUID or null/undefined
    if (ownerId && !validateUuid(ownerId)) {
      this.logger.warn(`Invalid UUID format for ownerId: ${ownerId}. Setting to undefined.`);
      ownerId = undefined;
    }

    this.logger.debug(`Processing upload URL: filename=${filename}, contentType=${contentType}, module=${module}, ownerId=${ownerId || 'null'}`);

    // Configuration
    const expiresIn = 3600; // 1 hour

    // Generate unique file key based on module
    const fileExtension = extname(filename);
    const uniqueId = uuidv4();
    const fileKey = this.generateFileKey(module, uniqueId, fileExtension);

    // Prepare metadata based on file type
    let finalMetadata = { ...metadata };

    if (this.isVideoFile(contentType)) {
      finalMetadata = { ...this.getVideoMetadataStructure(), ...metadata };
      this.logger.debug(`Video file detected, metadata structure initialized`);
    } else if (this.isAudioFile(contentType)) {
      finalMetadata = { ...this.getAudioMetadataStructure(), ...metadata };
      this.logger.debug(`Audio file detected, metadata structure initialized`);
    } else if (this.isImageFile(contentType)) {
      finalMetadata = { ...this.getImageMetadataStructure(), ...metadata };
      this.logger.debug(`Image file detected, metadata structure initialized`);
    }

    // Generate presigned URL for upload using R2
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.r2Client, command, { expiresIn });

    // Generate public file URL (for accessing the file after upload)
    const fileUrl = `${this.publicUrl}/${fileKey}`;

    // Prepare file asset data
    const fileAssetData = {
      fileUrl: fileUrl,
      mimeType: contentType,
      fileSize: null, // Will be updated on confirmation
      status: FileStatus.PENDING, // Pending until client confirms upload
      ownerId: ownerId || null, // Prisma expects null not undefined
      moduleOrigin: module,
      metadata: finalMetadata,
    };

    // Create file record in database
    const fileAsset = await this.prisma.fileAsset.create({
      data: fileAssetData,
    });

    this.logger.log(`Generated presigned upload URL for file ${fileAsset.id}: ${fileKey}`);

    return {
      uploadUrl: uploadUrl,
      fileId: fileAsset.id,
      fileUrl: fileAsset.fileUrl,
      expiresIn: expiresIn,
    };
  }

  /**
   * Confirm file upload and verify file exists in R2
   */
  async confirmUpload(request: StorageConfirmUploadRequestDTO): Promise<StorageConfirmUploadResponseDTO> {
    const { fileId } = request;

    // Find file record
    const fileAsset = await this.prisma.fileAsset.findUnique({
      where: { id: fileId },
    });

    if (!fileAsset) {
      throw new Error(`File asset ${fileId} not found`);
    }

    // Extract file key from fileUrl for R2 operations
    const fileKey = this.extractKeyFromUrl(fileAsset.fileUrl);

    // Verify file exists in R2 using HeadObject
    const headCommand = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    const headResult = await this.r2Client.send(headCommand);

    // Update file size if available
    if (headResult.ContentLength) {
      await this.prisma.fileAsset.update({
        where: { id: fileId },
        data: {
          fileSize: BigInt(headResult.ContentLength),
          status: FileStatus.UPLOADED, // Mark as uploaded
        },
      });
    }

    this.logger.log(`Confirmed upload for file ${fileId}: ${fileKey}, size: ${headResult.ContentLength} bytes`);

    return {
      success: true,
      fileId: fileAsset.id,
      fileUrl: fileAsset.fileUrl,
    };
  }

  /**
   * Direct upload - Server handles the upload to R2
   * Use this for small files (<5MB) or when server-side processing is needed
   */
  async directUpload(request: StorageDirectUploadRequestDTO): Promise<StorageDirectUploadResponseDTO> {
    const { filename, contentType, module, metadata = {}, fileData } = request;
    let { ownerId } = request;

    // Validate ownerId
    if (ownerId && !validateUuid(ownerId)) {
      this.logger.warn(`Invalid UUID format for ownerId: ${ownerId}. Setting to undefined.`);
      ownerId = undefined;
    }

    this.logger.debug(`Processing direct upload: filename=${filename}, contentType=${contentType}, module=${module}`);

    // Generate unique file key
    const fileExtension = extname(filename);
    const uniqueId = uuidv4();
    const fileKey = this.generateFileKey(module, uniqueId, fileExtension);

    // Prepare metadata based on file type
    let finalMetadata = { ...metadata };
    if (this.isVideoFile(contentType)) {
      finalMetadata = { ...this.getVideoMetadataStructure(), ...metadata };
    } else if (this.isAudioFile(contentType)) {
      finalMetadata = { ...this.getAudioMetadataStructure(), ...metadata };
    } else if (this.isImageFile(contentType)) {
      finalMetadata = { ...this.getImageMetadataStructure(), ...metadata };
    }

    // Decode base64 file data
    const fileBuffer = Buffer.from(fileData, 'base64');
    const fileSize = fileBuffer.length;

    // Upload directly to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.r2Client.send(uploadCommand);

    // Generate public file URL
    const fileUrl = `${this.publicUrl}/${fileKey}`;

    // Create file record in database with 'uploaded' status
    const fileAsset = await this.prisma.fileAsset.create({
      data: {
        fileUrl: fileUrl,
        mimeType: contentType,
        fileSize: BigInt(fileSize),
        status: FileStatus.UPLOADED, // Already uploaded
        ownerId: ownerId || null,
        moduleOrigin: module,
        metadata: finalMetadata,
      },
    });

    this.logger.log(`Direct upload completed for file ${fileAsset.id}: ${fileKey}, size: ${fileSize} bytes`);

    return {
      success: true,
      fileId: fileAsset.id,
      fileUrl: fileAsset.fileUrl,
      fileSize: fileSize,
    };
  }

  /**
   * Get signed URL for temporary file access
   * Useful for private files or when public access is not enabled
   */
  async getSignedUrl(request: StorageGetSignedUrlRequestDTO): Promise<StorageGetSignedUrlResponseDTO> {
    const { fileId, expiresIn = 3600 } = request;

    // Find file record
    const fileAsset = await this.prisma.fileAsset.findUnique({
      where: { id: fileId },
    });

    if (!fileAsset) {
      throw new Error(`File asset ${fileId} not found`);
    }

    // Extract file key from fileUrl
    const fileKey = this.extractKeyFromUrl(fileAsset.fileUrl);

    // Generate signed URL for GET operation
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(this.r2Client, command, { expiresIn });

    this.logger.log(`Generated signed URL for file ${fileId}, expires in ${expiresIn}s`);

    return {
      fileId: fileAsset.id,
      signedUrl: signedUrl,
      expiresIn: expiresIn,
    };
  }

  /**
   * Delete file from R2 and database
   */
  async deleteFile(request: StorageDeleteFileRequestDTO): Promise<StorageDeleteFileResponseDTO> {
    const { fileId } = request;

    // Find file record
    const fileAsset = await this.prisma.fileAsset.findUnique({
      where: { id: fileId },
    });

    if (!fileAsset) {
      throw new Error(`File asset ${fileId} not found`);
    }

    // Extract file key from fileUrl for R2 operations
    const fileKey = this.extractKeyFromUrl(fileAsset.fileUrl);

    // Delete from R2
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.r2Client.send(deleteCommand);
      this.logger.log(`Deleted file from R2: ${fileKey}`);
    } catch (error) {
      this.logger.warn(`Failed to delete file from R2: ${error.message}`);
      // Continue to delete from database even if R2 deletion fails
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
  }

  /**
   * Generate file key based on module and unique ID
   * Format: {module}/{uuid}.{ext}
   */
  private generateFileKey(module: string, uniqueId: string, extension: string): string {
    const sanitizedModule = module.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitizedModule}/${uniqueId}${extension}`;
  }

  /**
   * Extract file key from R2 public URL
   * URL format: https://{bucketName}.{accountId}.r2.cloudflarestorage.com/{key}
   */
  private extractKeyFromUrl(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      // Extract path after the domain (remove leading slash)
      const key = url.pathname.substring(1);
      if (!key) {
        throw new Error(`Invalid file URL format: ${fileUrl}`);
      }
      return decodeURIComponent(key);
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
   * Check if file is an audio based on MIME type
   */
  private isAudioFile(mimeType: string): boolean {
    return mimeType?.startsWith('audio/') || false;
  }

  /**
   * Check if file is an image based on MIME type
   */
  private isImageFile(mimeType: string): boolean {
    return mimeType?.startsWith('image/') || false;
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

  /**
   * Get audio metadata structure for storage
   */
  private getAudioMetadataStructure(): Record<string, any> {
    return {
      type: 'audio',
      duration: null, // in seconds
      bitrate: null, // in bps
      sampleRate: null, // in Hz (e.g., 44100, 48000)
      channels: null, // 1 for mono, 2 for stereo
      codec: null, // audio codec (e.g., 'mp3', 'aac', 'opus')
    };
  }

  /**
   * Get image metadata structure for storage
   */
  private getImageMetadataStructure(): Record<string, any> {
    return {
      type: 'image',
      width: null, // in pixels
      height: null, // in pixels
      format: null, // image format (e.g., 'jpeg', 'png', 'webp', 'gif')
    };
  }
}