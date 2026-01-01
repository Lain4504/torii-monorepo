import { Controller, Post, Body, Get, Query, Delete, UseGuards, UseInterceptors, UploadedFile, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../../modules/storage/storage.service';
import type {
    StoragePresignedUrlRequestDTO,
    StorageConfirmUploadRequestDTO,
    StorageDeleteFileRequestDTO,
    StorageGetSignedUrlRequestDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';

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
        @Body() body: any // usageType, userId etc.
    ) {
        // Construct DTO expected by service
        // Assuming service expects { file: Buffer, filename: string, mimetype: string, ... } or similar
        // We might need to adjust service or map properly.
        // For now, mapping Multer file to what Schema likely expects.
        // Inspecting NATS controller: it passed `data` directly.
        return this.storageService.directUpload({
            ...body,
            file: file.buffer, // Pass buffer
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
    }
}
