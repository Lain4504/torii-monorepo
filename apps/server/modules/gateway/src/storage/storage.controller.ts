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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  DeleteFileResponse,
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
}

