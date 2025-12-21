import { IsString, IsNotEmpty, IsOptional, IsObject, IsNumber, IsBoolean } from 'class-validator';

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
  supabaseUrl?: string;
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

