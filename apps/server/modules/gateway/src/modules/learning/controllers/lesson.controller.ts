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
    successPaginatedResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('api/lessons')
@UseGuards(IdentityAuthGuard)
export class LessonController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.findAll' },
                    { page, limit, search }
                )
            );
            return successPaginatedResponse(
                result.data,
                result.total,
                result.page,
                result.limit,
                result.totalPages
            );
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch lessons');
        }
    }

    @Get('by-module/:moduleId')
    async findByModuleId(
        @Param('moduleId') moduleId: string,
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.findByModuleId' },
                    { moduleId, userId: user.sub }
                )
            );
            return successResponse(result);
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
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch preview lessons');
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.lesson.findOne' }, { id })
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch lesson');
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.create' },
                    { ...dto, userId: user.sub }
                )
            );
            return successResponse(result, 'Lesson created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create lesson');
        }
    }

    @Post('reorder/:moduleId')
    async reorder(
        @Param('moduleId') moduleId: string,
        @Body() lessonOrders: { id: string; orderIndex: number }[],
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.reorder' },
                    { moduleId, lessonOrders, userId: user.sub }
                )
            );
            return successResponse(result, 'Lessons reordered successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to reorder lessons');
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.update' },
                    { id, ...dto, userId: user.sub }
                )
            );
            return successResponse(result, 'Lesson updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update lesson');
        }
    }

    @Delete(':id')
    async delete(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete: string,
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const isHardDelete = hardDelete === 'true';
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.delete' },
                    { id, userId: user.sub, hardDelete: isHardDelete }
                )
            );
            return successResponse(null, 'Lesson deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete lesson');
        }
    }
}
