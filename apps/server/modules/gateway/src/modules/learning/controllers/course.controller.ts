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
    GlobalExceptionsFilter,
    GatewayAuthGuard,
    RolesGuard,
    Roles,
    successResponse,
    successPaginatedResponse,
    Public
} from '@server/shared';
// Remove GatewayAuthGuard import if unused
import { Request } from 'express';
import { UserRole, Requester } from '@workspace/schemas';

interface RequestWithUser extends Request {
    user: Requester & { email: string };
}

@Controller('api/courses')
@UseGuards(GatewayAuthGuard, RolesGuard)
export class CourseController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS)
    @HttpCode(HttpStatus.CREATED)
    async createCourse(@Body() dto: any, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.create' },
                { ...dto, instructorId: user.sub, userRole: user.role, userEmail: user.email }
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
    async getCourses(@Query() query: any, @Req() req: RequestWithUser) {
        const user = req.user;

        // If lecturer, only show their courses by default
        if (user?.role === UserRole.LECTURER) {
            query.instructorId = user.sub;
        }

        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.course.findAll' }, query)
        );
        return successPaginatedResponse(result);
    }

    @Get(':id')
    @Public()
    async getCourse(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.findOne' },
                { id, userId: user?.sub }
            )
        );
        return successResponse({ course: result });
    }

    @Get('slug/:slug')
    @Public()
    async getCourseBySlug(@Param('slug') slug: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.findBySlug' },
                { slug, userId: user?.sub }
            )
        );
        return successResponse({ course: result });
    }

    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.LECTURER, UserRole.STAFF, UserRole.STAFF_LMS)
    async updateCourse(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req: RequestWithUser
    ) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.update' },
                { id, ...dto, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse({ course: result }, 'Course updated successfully');
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async deleteCourse(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.delete' },
                { id, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse(null, 'Course deleted successfully');
    }

    @Get(':id/enrollment-status')
    async checkEnrollmentStatus(@Param('id') id: string, @Req() req: Request) {
        // Placeholder implementation matching original service
        return successResponse({ isEnrolled: false });
    }

    @Get(':id/curriculum')
    @Public()
    async getCurriculum(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as any;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.getCurriculum' },
                { id, userId: user?.sub }
            )
        );
        return successResponse(result);
    }

    @Post(':id/unpublish')
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS)
    async unpublishCourse(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.unpublish' },
                { id, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse({ course: result }, 'Course unpublished successfully');
    }

    @Patch(':id/live-config')
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS, UserRole.LECTURER)
    async updateLiveConfig(@Param('id') id: string, @Body() config: any, @Req() req: RequestWithUser) {
        // TODO: Ensure lecturer is assigned to this course before allowing update
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.updateLiveConfig' },
                { id, config }
            )
        );
        return successResponse({ course: result }, 'Live configuration updated successfully');
    }

    @Post(':id/submit-for-review')
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS, UserRole.LECTURER)
    async submitForReview(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.submitForReview' },
                { id, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse({ course: result }, 'Course submitted for review successfully');
    }

    @Post(':id/publish')
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS)
    async publishCourse(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.publish' },
                { id, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse({ course: result }, 'Course published successfully');
    }

    @Post(':id/reject')
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS)
    async rejectCourse(
        @Param('id') id: string,
        @Body() body: { reason: string },
        @Req() req: RequestWithUser
    ) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.reject' },
                { id, userId: user.sub, userRole: user.role, userEmail: user.email, reason: body.reason }
            )
        );
        return successResponse({ course: result }, 'Course rejected successfully');
    }

}
