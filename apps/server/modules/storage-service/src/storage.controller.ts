import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RpcException } from '@nestjs/microservices';
import { NatsContext } from '@nestjs/microservices';
import { StorageService } from './storage.service';
import {
  PresignedUploadUrlRequest,
  PresignedUploadUrlResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  DeleteFileRequest,
  DeleteFileResponse,
  DirectUploadRequest,
  DirectUploadResponse,
  GetSignedUrlRequest,
  GetSignedUrlResponse,
} from '@workspace/dtos';

@Controller()
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly storageService: StorageService) { }

  @MessagePattern({ cmd: 'storage.generate-upload-url' })
  async generatePresignedUploadUrl(
    @Payload() data: PresignedUploadUrlRequest,
    @Ctx() context: NatsContext,
  ): Promise<PresignedUploadUrlResponse> {
    this.logger.log(`Received request: storage.generate-upload-url`);
    this.logger.debug(`Request data: ${JSON.stringify(data)}`);
    try {
      return await this.storageService.generatePresignedUploadUrl(data);
    } catch (error) {
      this.logger.error(`Error in generate-upload-url: ${error.message}`, error.stack);
      throw new RpcException({
        message: error.message,
        status: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'storage.confirm-upload' })
  async confirmUpload(
    @Payload() data: ConfirmUploadRequest,
    @Ctx() context: NatsContext,
  ): Promise<ConfirmUploadResponse> {
    this.logger.log(`Received request: storage.confirm-upload`);
    try {
      return await this.storageService.confirmUpload(data);
    } catch (error) {
      this.logger.error(`Error in confirm-upload: ${error.message}`, error.stack);
      throw new RpcException({
        message: error.message,
        status: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'storage.delete-file' })
  async deleteFile(
    @Payload() data: DeleteFileRequest,
    @Ctx() context: NatsContext,
  ): Promise<DeleteFileResponse> {
    this.logger.log(`Received request: storage.delete-file`);
    try {
      return await this.storageService.deleteFile(data);
    } catch (error) {
      this.logger.error(`Error in delete-file: ${error.message}`, error.stack);
      throw new RpcException({
        message: error.message,
        status: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'storage.direct-upload' })
  async directUpload(
    @Payload() data: DirectUploadRequest,
    @Ctx() context: NatsContext,
  ): Promise<DirectUploadResponse> {
    this.logger.log(`Received request: storage.direct-upload`);
    try {
      return await this.storageService.directUpload(data);
    } catch (error) {
      this.logger.error(`Error in direct-upload: ${error.message}`, error.stack);
      throw new RpcException({
        message: error.message,
        status: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'storage.get-signed-url' })
  async getSignedUrl(
    @Payload() data: GetSignedUrlRequest,
    @Ctx() context: NatsContext,
  ): Promise<GetSignedUrlResponse> {
    this.logger.log(`Received request: storage.get-signed-url`);
    try {
      return await this.storageService.getSignedUrl(data);
    } catch (error) {
      this.logger.error(`Error in get-signed-url: ${error.message}`, error.stack);
      throw new RpcException({
        message: error.message,
        status: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'storage.ping' })
  ping() {
    return { service: 'storage', status: 'ok' };
  }
}
