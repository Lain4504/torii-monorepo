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
    errorResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/lesson-materials')
@UseGuards(GatewayAuthGuard)
export class LessonMaterialController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    async uploadMaterial(
        @Body() body: { dto: any; fileId: string },
        @Req() req: ReqWithRequester
    ) {
        const { dto, fileId } = body;

        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson-material.upload' },
                    {
                        dto,
                        fileId,
                        userId: requester.sub,
                        userRole: requester.role,
                        userPermissions: requester.permissions
                    }
                )
            );
            return successResponse({ material: result }, 'Material uploaded successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to upload material');
        }
    }

    @Get('by-lesson/:lessonId')
    async getMaterialsByLesson(
        @Param('lessonId') lessonId: string,
        @Req() req: ReqWithRequester,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson-material.findByLessonId' },
                    { lessonId, requester: req.requester }
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
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson-material.update' },
                    { id, ...dto, userId: requester.sub, userRole: requester.role, userPermissions: requester.permissions }
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
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson-material.delete' },
                    { id, userId: requester.sub, userRole: requester.role, userPermissions: requester.permissions }
                )
            );
            return successResponse(result, 'Material deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete material');
        }
    }
}
