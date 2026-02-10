import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Inject,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    successPaginatedResponse,
    Public,
    Permissions,
    PermissionsGuard,
    ReqWithRequester,
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';

@Controller('api/lessons')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LessonController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
        @Query('moduleId') moduleId?: string,
        @Query('contentType') contentType?: string,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.findAll' },
                    { page, limit, search, moduleId, contentType }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch lessons');
        }
    }

    @Get('by-module/:moduleId')
    async findByModuleId(
        @Param('moduleId') moduleId: string,
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.findByModuleId' },
                    { moduleId, userId: requester.sub }
                )
            );
            return successResponse({ lessons: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch module lessons');
        }
    }

    @Get('preview/by-course/:courseId')
    async findPreviewLessonsByCourseId(@Param('courseId') courseId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.findPreviewLessonsByCourseId' },
                    { courseId }
                )
            );
            return successResponse({ lessons: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch preview lessons');
        }
    }

    @Get(':id')
    @Public()
    async findOne(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.findOne' },
                    { id, userId: requester?.sub }
                )
            );
            return successResponse({ lesson: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch lesson');
        }
    }

    @Post()
    @Permissions('lesson.create')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.create' },
                    { ...dto, userId: requester.sub }
                )
            );
            return successResponse({ lesson: result }, 'Lesson created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create lesson');
        }
    }

    @Post('reorder/:moduleId')
    @Permissions('lesson.update')
    async reorder(
        @Param('moduleId') moduleId: string,
        @Body() lessonOrders: { id: string; orderIndex: number }[],
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.reorder' },
                    { moduleId, lessonOrders, userId: requester.sub, userRole: requester.role, userPermissions: requester.permissions }
                )
            );
            return successResponse({ lessons: result }, 'Lessons reordered successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to reorder lessons');
        }
    }

    @Patch(':id')
    @Permissions('lesson.update')
    async update(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.update' },
                    { id, ...dto, userId: requester.sub, userRole: requester.role, userPermissions: requester.permissions }
                )
            );
            return successResponse({ lesson: result }, 'Lesson updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update lesson');
        }
    }

    @Delete(':id')
    @Permissions('lesson.delete')
    async delete(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete: string,
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const isHardDelete = hardDelete === 'true';
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.delete' },
                    { id, userId: requester.sub, userRole: requester.role, hardDelete: isHardDelete, userPermissions: requester.permissions }
                )
            );
            return successResponse(null, 'Lesson deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete lesson');
        }
    }
}
