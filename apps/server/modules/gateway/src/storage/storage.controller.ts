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
  storagePresignedUrlRequestDTOSchema,
  storageConfirmUploadRequestDTOSchema,
  storageGetSignedUrlRequestDTOSchema,
} from '@workspace/schemas';
import type {
  StoragePresignedUrlRequestDTO,
  StoragePresignedUrlResponseDTO,
  StorageConfirmUploadRequestDTO,
  StorageConfirmUploadResponseDTO,
  StorageDeleteFileResponseDTO,
  StorageGetSignedUrlRequestDTO,
  StorageGetSignedUrlResponseDTO,
} from '@workspace/schemas';
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';

@Controller('api/storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(storagePresignedUrlRequestDTOSchema))
  async generateUploadUrl(
    @Body() body: StoragePresignedUrlRequestDTO,
  ): Promise<StoragePresignedUrlResponseDTO> {
    this.logger.log(`Received request for upload-url`);
    this.logger.debug(`Body received: ${JSON.stringify(body)}`);
    return lastValueFrom(
      this.natsClient.send<StoragePresignedUrlResponseDTO>({ cmd: 'storage.generate-upload-url' }, body),
    );
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(storageConfirmUploadRequestDTOSchema))
  async confirmUpload(
    @Body() body: StorageConfirmUploadRequestDTO,
  ): Promise<StorageConfirmUploadResponseDTO> {
    this.logger.log(`Received request for confirm-upload`);
    return lastValueFrom(
      this.natsClient.send<StorageConfirmUploadResponseDTO>({ cmd: 'storage.confirm-upload' }, body),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('id') fileId: string): Promise<StorageDeleteFileResponseDTO> {
    this.logger.log(`Received request to delete file: ${fileId}`);
    return lastValueFrom(
      this.natsClient.send<StorageDeleteFileResponseDTO>({ cmd: 'storage.delete-file' }, { fileId }),
    );
  }

  @Post('signed-url')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(storageGetSignedUrlRequestDTOSchema))
  async getSignedUrl(@Body() body: StorageGetSignedUrlRequestDTO): Promise<StorageGetSignedUrlResponseDTO> {
    this.logger.log(`Received request for signed-url`);
    return lastValueFrom(
      this.natsClient.send<StorageGetSignedUrlResponseDTO>({ cmd: 'storage.get-signed-url' }, body),
    );
  }
}

