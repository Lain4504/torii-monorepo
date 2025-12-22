import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  DeleteFileResponse,
  DirectUploadRequest,
  DirectUploadResponse,
} from '@workspace/dtos';

@Controller('api/storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  async generateUploadUrl(
    @Body() body: PresignedUploadUrlRequest,
  ): Promise<PresignedUploadUrlResponse> {
    this.logger.log(`Received request for upload-url`);
    this.logger.debug(`Body received: ${JSON.stringify(body)}`);
    return lastValueFrom(
      this.natsClient.send({ cmd: 'storage.generate-upload-url' }, body),
    );
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmUpload(
    @Body() body: ConfirmUploadRequest,
  ): Promise<ConfirmUploadResponse> {
    this.logger.log(`Received request for confirm-upload`);
    return lastValueFrom(
      this.natsClient.send({ cmd: 'storage.confirm-upload' }, body),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('id') fileId: string): Promise<DeleteFileResponse> {
    this.logger.log(`Received request to delete file: ${fileId}`);
    return lastValueFrom(
      this.natsClient.send({ cmd: 'storage.delete-file' }, { fileId }),
    );
  }

  @Post('signed-url')
  @HttpCode(HttpStatus.OK)
  async getSignedUrl(@Body() body: any) {
    this.logger.log(`Received request for signed-url`);
    return lastValueFrom(
      this.natsClient.send({ cmd: 'storage.get-signed-url' }, body),
    );
  }

  @Post('direct-upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async directUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body('module') module?: string,
    @Body('ownerId') ownerId?: string,
    @Body('metadata') metadata?: string,
  ): Promise<DirectUploadResponse> {
    this.logger.log(`Received request for direct-upload`);

    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Please send a file with field name "file" in multipart/form-data format.',
      );
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    // Convert file to base64
    const fileData = file.buffer.toString('base64');

    // Parse metadata if provided as JSON string
    let parsedMetadata: Record<string, any> = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        this.logger.warn('Failed to parse metadata JSON, using empty object');
      }
    }

    const uploadRequest: DirectUploadRequest = {
      filename: file.originalname,
      contentType: file.mimetype,
      module: module || 'GENERAL',
      fileData,
      ownerId,
      metadata: parsedMetadata,
    };

    return lastValueFrom(
      this.natsClient.send<DirectUploadResponse>(
        { cmd: 'storage.direct-upload' },
        uploadRequest,
      ),
    );
  }
}

