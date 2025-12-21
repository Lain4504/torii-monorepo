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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

export class GenerateUploadUrlDto {
  filename: string;
  contentType: string;
  module: string;
  ownerId?: string;
  metadata?: Record<string, any>;
}

export class ConfirmUploadDto {
  fileId: string;
}

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate presigned upload URL' })
  @ApiResponse({ status: 200, description: 'Upload URL generated successfully' })
  async generateUploadUrl(@Body() body: any) {
    this.logger.log(`Received request for upload-url`);
    this.logger.debug(`Body received: ${JSON.stringify(body)}`);
    // Send body directly to microservice (like other controllers)
    return lastValueFrom(
      this.natsClient.send({ cmd: 'storage.generate-upload-url' }, body),
    );
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm file upload' })
  @ApiResponse({ status: 200, description: 'Upload confirmed successfully' })
  async confirmUpload(@Body() body: any) {
    return lastValueFrom(
      this.natsClient.send({ cmd: 'storage.confirm-upload' }, body),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('id') fileId: string) {
    return lastValueFrom(
      this.natsClient.send({ cmd: 'storage.delete-file' }, { fileId }),
    );
  }
}


