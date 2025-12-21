import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RpcException } from '@nestjs/microservices';
import { NatsContext } from '@nestjs/microservices';
import { StorageService } from './storage.service';

@Controller()
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly storageService: StorageService) {}

  @MessagePattern({ cmd: 'storage.generate-upload-url' })
  async generatePresignedUploadUrl(
    @Payload() data: any,
    @Ctx() context: NatsContext,
  ) {
    this.logger.log(`Received request: storage.generate-upload-url`);
    this.logger.debug(`Request data: ${JSON.stringify(data)}`);
    try {
      const result = await this.storageService.generatePresignedUploadUrl(data);
      return result;
    } catch (error) {
      this.logger.error(`Error in generate-upload-url: ${error.message}`, error.stack);
      throw new RpcException({
        message: error.message,
        status: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'storage.confirm-upload' })
  async confirmUpload(@Payload() data: any, @Ctx() context: NatsContext) {
    this.logger.log(`Received request: storage.confirm-upload`);
    try {
      const result = await this.storageService.confirmUpload(data);
      return result;
    } catch (error) {
      this.logger.error(`Error in confirm-upload: ${error.message}`, error.stack);
      throw new RpcException({
        message: error.message,
        status: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'storage.delete-file' })
  async deleteFile(@Payload() data: any, @Ctx() context: NatsContext) {
    this.logger.log(`Received request: storage.delete-file`);
    try {
      const result = await this.storageService.deleteFile(data);
      return result;
    } catch (error) {
      this.logger.error(`Error in delete-file: ${error.message}`, error.stack);
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


