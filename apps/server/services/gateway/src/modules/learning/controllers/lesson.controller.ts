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
    ZodValidationPipe,
} from '@server/shared';
import { LessonSearchRequestDTO, lessonSearchRequestDTOSchema } from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';

@Controller('api/lessons')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LessonController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('search')
    @Permissions('course.view_restricted', 'course.view_my')
    async searchLessons(
        @Body(new ZodValidationPipe(lessonSearchRequestDTOSchema)) dto: LessonSearchRequestDTO,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.search' },
                    dto
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to search lessons');
        }
    }

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
                    { page, limit, search }
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
                    { moduleId, requester: req.requester }
                )
            );
            return successResponse({ lessons: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch module lessons');
        }
    }

    @Get('preview/by-course/:courseMasterId')
    async findPreviewLessonsByCourseId(@Param('courseMasterId') courseMasterId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.findPreviewLessonsByCourseId' },
                    { courseMasterId }
                )
            );
            return successResponse({ lessons: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch preview lessons');
        }
    }

    @Get(':id')
    @Public()
    async findById(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.lesson.findById' },
                    { id, requester: req.requester }
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
                    { ...dto, requester: req.requester }
                )
            );
            return successResponse({ lesson: result }, 'Lesson created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create lesson');
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
                    { id, ...dto, requester: req.requester }
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
                    { id, hardDelete: isHardDelete, requester: req.requester }
                )
            );
            return successResponse(null, 'Lesson deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete lesson');
        }
    }
}
