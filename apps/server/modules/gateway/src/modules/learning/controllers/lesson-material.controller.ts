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
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
// Removed FileInterceptor import
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';
import { Request } from 'express';

@Controller('api/lesson-materials')
@UseGuards(GatewayAuthGuard)
export class LessonMaterialController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    async uploadMaterial(
        @Body() body: { dto: any; fileId: string },
        @Req() req: Request
    ) {
        const { dto, fileId } = body;

        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson-material.upload' },
                    {
                        dto,
                        fileId,
                        userId: user.sub,
                        userRole: user.role,
                        userPermissions: user.permissions
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
                    { id, ...dto, userId: user.sub, userRole: user.role, userPermissions: user.permissions }
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
                    { id, userId: user.sub, userRole: user.role, userPermissions: user.permissions }
                )
            );
            return successResponse(result, 'Material deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete material');
        }
    }
}
