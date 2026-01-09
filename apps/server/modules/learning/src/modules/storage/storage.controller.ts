import { Controller, Post, Body, Get, Query, Delete, UseGuards, UseInterceptors, UploadedFile, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import type {
    StoragePresignedUrlRequestDTO,
    StorageConfirmUploadRequestDTO,
    StorageDeleteFileRequestDTO,
    StorageGetSignedUrlRequestDTO,
} from '@workspace/schemas';
// Auth Guard? Learning Service usually is behind Gateway which handles Auth?
// Or we use a shared AuthGuard if we want internal checks?
// Usually microservices trust the Gateway or check a header.
// But if we use `GatewayAuthGuard` it might verify the JWT passed from Gateway.
// Let's check other controllers in Learning Service if available, or just skip guard if Gateway checks it.
// Checking imports list... `GatewayAuthGuard` is in `@server/shared`.
import { GatewayAuthGuard } from '@server/shared/guards/gateway-auth.guard';

@Controller('storage')
@UseGuards(GatewayAuthGuard)
export class StorageController {
    private readonly logger = new Logger(StorageController.name);

    constructor(private readonly storageService: StorageService) { }

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
