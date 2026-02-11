import {
    Controller,
    Get,
    Post,
    Put,
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
    ParseUUIDPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    successResponse,
    successPaginatedResponse,
    Public,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/courses')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CourseController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @Permissions('course.create')
    @HttpCode(HttpStatus.CREATED)
    async createCourse(@Body() dto: any, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.create' },
                { ...dto, instructorId: requester.sub, userPermissions: requester.permissions }
            )
        );
        return successResponse({ course: result }, 'Course created successfully');
    }

    @Get('categories')
    @Public()
    async getCategories() {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.category.findAll' }, {})
        );
        return successResponse({ categories: result });
    }

    @Get('advanced-search')
    @Public()
    async advancedSearch(@Query() query: any) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.course.advancedSearch' }, query)
        );
        return successPaginatedResponse(result);
    }

    @Get('by-type/:type')
    @Public()
    async getByType(@Param('type') type: 'vod' | 'live') {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.course.getByType' }, { type })
        );
        return successResponse({ courses: result });
    }

    @Get()
    @Public()
    async getCourses(@Query() query: any, @Req() req: ReqWithRequester) {
        const requester = req.requester;

        // Logic:
        // 1. Admin/Staff (with * or course.view_restricted): see everything.
        // 2. Lecturer: only see their assigned courses (instructorId = sub).
        // 3. Learner: see everything but filtered by status (handled by default query).
        // Note: system now relies on permissions. If course.view_restricted is missing, limit to self as instructor.
        if (requester) {
            const permissions = requester.permissions || [];
            if (!permissions.includes('*') && !permissions.includes('course.view_restricted') && permissions.includes('course.instructor')) {
                query.instructorId = requester.sub;
            }
        }

        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.course.findAll' }, query)
        );
        return successPaginatedResponse(result);
    }

    @Get(':id')
    @Public()
    async getCourse(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.findOne' },
                { id, userId: requester?.sub }
            )
        );
        return successResponse({ course: result });
    }

    @Get('slug/:slug')
    @Public()
    async getCourseBySlug(@Param('slug') slug: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.findBySlug' },
                { slug, userId: requester?.sub }
            )
        );
        return successResponse({ course: result });
    }

    @Put(':id')
    @Permissions('course.update')
    async updateCourse(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req: ReqWithRequester
    ) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.update' },
                { id, ...dto, userId: requester.sub, userPermissions: requester.permissions }
            )
        );
        return successResponse({ course: result }, 'Course updated successfully');
    }

    @Delete(':id')
    @Permissions('course.delete')
    async deleteCourse(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.delete' },
                { id, userId: requester.sub, userPermissions: requester.permissions }
            )
        );
        return successResponse(null, 'Course deleted successfully');
    }

    @Get(':id/enrollment-status')
    async checkEnrollmentStatus(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        if (!requester?.sub) {
            return successResponse({ isEnrolled: false });
        }
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.check' },
                    { courseId: id, userId: requester.sub },
                ),
            );
            return successResponse(result);
        } catch {
            return successResponse({ isEnrolled: false });
        }
    }

    @Get(':id/curriculum')
    @Public()
    async getCurriculum(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.getCurriculum' },
                { id, userId: requester?.sub }
            )
        );
        return successResponse(result);
    }

    @Post(':id/unpublish')
    @Permissions('course.publish')
    async unpublishCourse(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.unpublish' },
                { id, userId: requester.sub, userPermissions: requester.permissions }
            )
        );
        return successResponse({ course: result }, 'Course unpublished successfully');
    }

    @Patch(':id/live-config')
    @Permissions('course.update')
    async updateLiveConfig(@Param('id', new ParseUUIDPipe()) id: string, @Body() config: any, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.updateLiveConfig' },
                { id, config, userId: requester.sub, userPermissions: requester.permissions }
            )
        );
        return successResponse({ course: result }, 'Live configuration updated successfully');
    }

    @Post(':id/submit-for-review')
    @Permissions('course.update')
    async submitForReview(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.submitForReview' },
                { id, userId: requester.sub, userPermissions: requester.permissions }
            )
        );
        return successResponse({ course: result }, 'Course submitted for review successfully');
    }

    @Post(':id/publish')
    @Permissions('course.publish')
    async publishCourse(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.publish' },
                { id, userId: requester.sub, userPermissions: requester.permissions }
            )
        );
        return successResponse({ course: result }, 'Course published successfully');
    }

    @Post(':id/reject')
    @Permissions('course.publish')
    async rejectCourse(
        @Param('id') id: string,
        @Body() body: { reason: string },
        @Req() req: ReqWithRequester
    ) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.reject' },
                { id, userId: requester.sub, reason: body.reason, userPermissions: requester.permissions }
            )
        );
        return successResponse({ course: result }, 'Course rejected successfully');
    }

}
