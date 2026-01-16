import {
    Controller,
    Get,
    Post,
    Put,
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
import { UserRole } from '@workspace/schemas';

@Controller('api/courses')
@UseGuards(IdentityAuthGuard)
export class CourseController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createCourse(@Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course.create' },
                    { ...dto, user }
                )
            );
            return successResponse({ course: result }, 'Course created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create course');
        }
    }

    @Get('advanced-search')
    async advancedSearch(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.course.advancedSearch' }, query)
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to search courses');
        }
    }

    @Get('by-type/:type')
    async getByType(@Param('type') type: 'vod' | 'live') {
        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.course.getByType' }, { type })
            );
            return successResponse({ courses: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch courses by type');
        }
    }

    @Get()
    async getCourses(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.course.findAll' }, query)
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch courses');
        }
    }

    @Get(':id')
    async getCourse(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course.findOne' },
                    { id, userId: user?.sub }
                )
            );
            return successResponse({ course: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch course');
        }
    }

    @Get('slug/:slug')
    async getCourseBySlug(@Param('slug') slug: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course.findBySlug' },
                    { slug, userId: user?.sub }
                )
            );
            return successResponse({ course: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch course');
        }
    }

    @Put(':id')
    async updateCourse(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course.update' },
                    { id, ...dto, user }
                )
            );
            return successResponse({ course: result }, 'Course updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update course');
        }
    }

    @Delete(':id')
    async deleteCourse(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course.delete' },
                    { id, user }
                )
            );
            return successResponse(null, 'Course deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete course');
        }
    }

    @Get(':id/enrollment-status')
    async checkEnrollmentStatus(@Param('id') id: string, @Req() req: Request) {
        // Placeholder implementation matching original service
        return successResponse({ isEnrolled: false });
    }

    @Get(':id/curriculum')
    async getCurriculum(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.course.getCurriculum' }, { id })
            );
            return successResponse(result); // Curriculum response is already an object { modules: [] }
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch curriculum');
        }
    }

    @Post(':id/unpublish')
    async unpublishCourse(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course.unpublish' },
                    { id, user }
                )
            );
            return successResponse({ course: result }, 'Course unpublished successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to unpublish course');
        }
    }

    @Post(':id/publish')
    async publishCourse(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course.publish' },
                    { id, user }
                )
            );
            return successResponse({ course: result }, 'Course published successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to publish course');
        }
    }
}
