import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Inject,
    BadRequestException,
    Req,
    Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    SharedStorageService
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('api/storage')
@UseGuards(IdentityAuthGuard)
export class StorageController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
        private readonly sharedStorage: SharedStorageService
    ) { }

    @Post('upload-url')
    async generatePresignedUploadUrl(@Body() data: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'storage.generatePresignedUploadUrl' },
                    { ...data, ownerId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to generate upload URL');
        }
    }

    @Post('confirm-upload')
    async confirmUpload(@Body() data: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'storage.confirmUpload' },
                    data
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to confirm upload');
        }
    }

    @Delete(':id')
    async deleteFile(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'storage.deleteFile' },
                    { fileId: id }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete file');
        }
    }

    @Get('signed-url')
    async getSignedUrl(@Query() data: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'storage.getSignedUrl' },
                    data
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to generate signed URL');
        }
    }

    @Post('direct-upload')
    @UseInterceptors(FileInterceptor('file'))
    async directUpload(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Req() req: Request
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        try {
            const user = req.user as any;
            // For direct upload, we upload to S3 from Gateway if it's small, 
            // OR we still proxy the buffer if we want the Storage Service to manage metadata.
            // Let's proxy to Storage Service to keep metadata logic centralized.

            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'storage.directUpload' },
                    {
                        filename: body.filename || file.originalname,
                        contentType: body.contentType || file.mimetype,
                        module: body.module || 'general',
                        ownerId: user.sub,
                        metadata: body.metadata ? (typeof body.metadata === 'string' ? JSON.parse(body.metadata) : body.metadata) : {},
                        file: {
                            buffer: file.buffer,
                            originalname: file.originalname,
                            mimetype: file.mimetype
                        }
                    }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to upload file');
        }
    }
}
