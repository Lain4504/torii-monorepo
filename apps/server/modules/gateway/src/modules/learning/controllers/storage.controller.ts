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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('storage')
@UseGuards(IdentityAuthGuard)
export class StorageController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('upload-url')
    async generatePresignedUploadUrl(@Body() data: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.storage.generatePresignedUploadUrl' },
                    data
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
                    { cmd: 'learning.storage.confirmUpload' },
                    data
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to confirm upload');
        }
    }

    @Delete('file')
    async deleteFile(@Body() data: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.storage.deleteFile' },
                    data
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
                    { cmd: 'learning.storage.getSignedUrl' },
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
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.storage.directUpload' },
                    {
                        filename: body.filename || file.originalname,
                        contentType: body.contentType || file.mimetype,
                        module: body.module,
                        ownerId: body.ownerId,
                        metadata: body.metadata ? JSON.parse(body.metadata) : {},
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
