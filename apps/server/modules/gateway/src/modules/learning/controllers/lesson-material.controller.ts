import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Inject,
    UseInterceptors,
    UploadedFile,
    Req,
    BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('api/lesson-materials')
@UseGuards(IdentityAuthGuard)
export class LessonMaterialController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadMaterial(
        @Body() dto: any,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson-material.upload' },
                    {
                        dto,
                        file: {
                            buffer: file.buffer,
                            originalname: file.originalname,
                            mimetype: file.mimetype
                        },
                        userId: user.sub
                    }
                )
            );
            return successResponse({ material: result }, 'Material uploaded successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to upload material');
        }
    }

    @Get('by-lesson/:lessonId')
    async getMaterialsByLesson(@Param('lessonId') lessonId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson-material.findByLessonId' },
                    { lessonId }
                )
            );
            return successResponse({ materials: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch materials');
        }
    }

    @Patch(':id')
    async updateMaterial(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson-material.update' },
                    { id, ...dto, userId: user.sub }
                )
            );
            return successResponse({ material: result }, 'Material updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update material');
        }
    }

    @Delete(':id')
    async deleteMaterial(
        @Param('id') id: string,
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson-material.delete' },
                    { id, userId: user.sub }
                )
            );
            return successResponse(result, 'Material deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete material');
        }
    }
}
