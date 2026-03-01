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
    ZodValidationPipe,
} from '@server/shared';
import { CourseMasterSearchRequestDTO, courseMasterSearchRequestDTOSchema } from '@workspace/schemas';

@Controller('api/courses')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CourseController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('search')
    @Permissions('course.view_restricted', 'course.view_my')
    async searchCourses(
        @Body(new ZodValidationPipe(courseMasterSearchRequestDTOSchema)) dto: CourseMasterSearchRequestDTO,
        @Req() req: ReqWithRequester
    ) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.findAll' },
                { query: dto, requester }
            )
        );
        return successPaginatedResponse(result);
    }

    @Post()
    @Permissions('course.create')
    @HttpCode(HttpStatus.CREATED)
    async createCourse(@Body() dto: any, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.create' },
                { ...dto, requester: req.requester }
            )
        );
        return successResponse({ course: result }, 'Course created successfully');
    }

    /*
    @Get('categories')
    @Public()
    async getCategories() {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.category.findAll' }, {})
        );
        return successResponse({ categories: result });
    }
    */

    @Get('advanced-search')
    @Public()
    async advancedSearch(@Query() query: any) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.courseMaster.advancedSearch' }, query)
        );
        return successPaginatedResponse(result);
    }

    @Get('by-type/:type')
    @Public()
    async getByType(@Param('type') type: 'vod' | 'live') {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.courseMaster.getByType' }, { type })
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
            this.natsClient.send({ cmd: 'learning.courseMaster.findAll' }, { query, requester })
        );
        return successPaginatedResponse(result);
    }

    @Get(':id')
    @Public()
    async getCourse(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.findById' },
                { id, requester: req.requester }
            )
        );
        return successResponse({ course: result });
    }

    @Get('slug/:slug')
    @Public()
    async getCourseBySlug(@Param('slug') slug: string, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.findBySlug' },
                { slug, requester: req.requester }
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
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.update' },
                { id, ...dto, requester: req.requester }
            )
        );
        return successResponse({ course: result }, 'Course updated successfully');
    }

    @Delete(':id')
    @Permissions('course.update')
    async deleteCourse(@Param('id') id: string, @Req() req: ReqWithRequester) {
        await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.delete' },
                { id, requester: req.requester }
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
                    { courseMasterId: id, requester },
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
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.getCurriculum' },
                { id, requester: req.requester }
            )
        );
        return successResponse(result);
    }

    @Post(':id/unpublish')
    @Permissions('course.publish')
    async unpublishCourse(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.unpublish' },
                { id, requester: req.requester }
            )
        );
        return successResponse({ course: result }, 'Course unpublished successfully');
    }

    @Patch(':id/live-config')
    @Permissions('course.update')
    async updateLiveConfig(@Param('id', new ParseUUIDPipe()) id: string, @Body() config: any, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.updateLiveConfig' },
                { id, config, requester: req.requester }
            )
        );
        return successResponse({ course: result }, 'Live configuration updated successfully');
    }

    @Post(':id/submit-for-review')
    @Permissions('course.update')
    async submitForReview(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.submitForReview' },
                { id, requester: req.requester }
            )
        );
        return successResponse({ course: result }, 'Course submitted for review successfully');
    }

    @Post(':id/publish')
    @Permissions('course.publish')
    async publishCourse(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.publish' },
                { id, requester: req.requester }
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
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.reject' },
                { id, reason: body.reason, requester: req.requester }
            )
        );
        return successResponse({ course: result }, 'Course rejected successfully');
    }

    @Get(':id/validate-scheduling')
    @Permissions('course.update')
    async validateScheduling(@Param('id') id: string) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.validateScheduling' },
                { id }
            )
        );
        return successResponse(result);
    }

    @Get(':id/students/count')
    @Public()
    async getStudentCount(@Param('id', new ParseUUIDPipe()) id: string) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courseMaster.getStudentCount' },
                { id }
            )
        );
        return successResponse(result);
    }
}
