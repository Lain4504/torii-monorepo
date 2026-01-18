import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Query,
    UseGuards,
    Inject,
    Req,
    Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { successResponse, errorResponse, GatewayAuthGuard } from '@server/shared';
import { Request } from 'express';

@Controller('api/storage')
@UseGuards(GatewayAuthGuard)
export class StorageController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
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
            // Result from NATS is plain DTO, wrap it in StandardApiResponse
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
            // Result from NATS is plain DTO, wrap it in StandardApiResponse
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
            // Result from NATS is plain DTO, wrap it in StandardApiResponse
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
            // Result from NATS is plain DTO, wrap it in StandardApiResponse
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to get signed URL');
        }
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'storage.findById' },
                    { fileId: id }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to get file');
        }
    }
}
