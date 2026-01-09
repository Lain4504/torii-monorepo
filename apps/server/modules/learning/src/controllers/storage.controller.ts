import { Controller, Post, Body, Get, Query, Delete, UseGuards, UseInterceptors, UploadedFile, Logger, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type {
    StoragePresignedUrlRequestDTO,
    StorageConfirmUploadRequestDTO,
    StorageDeleteFileRequestDTO,
    StorageGetSignedUrlRequestDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared/guards/gateway-auth.guard';
import type { IStorageService } from '../interfaces/services/i-storage.service';
import { STORAGE_SERVICE_TOKEN } from '../interfaces/services/i-storage.service';

@Controller('storage')
@UseGuards(GatewayAuthGuard)
export class StorageController {
    private readonly logger = new Logger(StorageController.name);

    constructor(
        @Inject(STORAGE_SERVICE_TOKEN)
        private readonly storageService: IStorageService,
    ) { }

    @Post('upload-url')
    async generatePresignedUploadUrl(@Body() data: StoragePresignedUrlRequestDTO) {
        return this.storageService.generatePresignedUploadUrl(data);
    }

    @Post('confirm-upload')
    async confirmUpload(@Body() data: StorageConfirmUploadRequestDTO) {
        return this.storageService.confirmUpload(data);
    }

    @Delete('file')
    async deleteFile(@Body() data: StorageDeleteFileRequestDTO) {
        return this.storageService.deleteFile(data);
    }

    @Get('signed-url')
    async getSignedUrl(@Query() data: StorageGetSignedUrlRequestDTO) {
        return this.storageService.getSignedUrl(data);
    }

    @Post('direct-upload')
    @UseInterceptors(FileInterceptor('file'))
    async directUpload(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any
    ) {
        return this.storageService.directUpload({
            filename: body.filename || file.originalname,
            contentType: body.contentType || file.mimetype,
            module: body.module || 'general',
            ownerId: body.ownerId,
            metadata: body.metadata ? JSON.parse(body.metadata) : {},
            fileData: '',
            file: file.buffer,
        });
    }
}

