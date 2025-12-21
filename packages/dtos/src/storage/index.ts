import { IsString, IsNotEmpty, IsOptional, IsObject, IsNumber, IsBoolean, IsIn } from 'class-validator';

/**
 * File upload status enum
 */
export enum FileStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  FAILED = 'failed',
}

export class PresignedUploadUrlRequest {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsNotEmpty()
  module: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class PresignedUploadUrlResponse {
  uploadUrl: string;
  fileId: string;
  fileUrl: string;
  expiresIn: number;
}


export class ConfirmUploadRequest {
  @IsString()
  @IsNotEmpty()
  fileId: string;
}

export class ConfirmUploadResponse {
  success: boolean;
  fileId: string;
  fileUrl: string;
}

export class DeleteFileRequest {
  @IsString()
  @IsNotEmpty()
  fileId: string;
}

export class DeleteFileResponse {
  success: boolean;
  message: string;
}

/**
 * Video metadata structure for video files
 */
export class VideoMetadata {
  type: 'video';
  duration?: number; // in seconds
  width?: number; // in pixels
  height?: number; // in pixels
  codec?: string; // video codec (e.g., 'h264', 'vp9', 'av1')
  bitrate?: number; // in bps
  fps?: number; // frames per second
  format?: string; // container format (e.g., 'mp4', 'webm', 'mov')
}

/**
 * Audio metadata structure for audio files
 */
export class AudioMetadata {
  type: 'audio';
  duration?: number; // in seconds
  bitrate?: number; // in bps
  sampleRate?: number; // in Hz (e.g., 44100, 48000)
  channels?: number; // 1 for mono, 2 for stereo
  codec?: string; // audio codec (e.g., 'mp3', 'aac', 'opus')
}

/**
 * Image metadata structure for image files
 */
export class ImageMetadata {
  type: 'image';
  width?: number; // in pixels
  height?: number; // in pixels
  format?: string; // image format (e.g., 'jpeg', 'png', 'webp', 'gif')
}

/**
 * Request for direct file upload (server handles upload to R2)
 */
export class DirectUploadRequest {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsNotEmpty()
  module: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  // Base64 encoded file content
  @IsString()
  @IsNotEmpty()
  fileData: string;
}

/**
 * Response for direct file upload
 */
export class DirectUploadResponse {
  success: boolean;
  fileId: string;
  fileUrl: string;
  fileSize: number;
}

/**
 * Request for getting signed URL to access file
 */
export class GetSignedUrlRequest {
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @IsNumber()
  @IsOptional()
  expiresIn?: number; // in seconds, default 3600
}

/**
 * Response for signed URL
 */
export class GetSignedUrlResponse {
  fileId: string;
  signedUrl: string;
  expiresIn: number;
}
