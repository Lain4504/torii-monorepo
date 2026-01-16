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
    successPaginatedResponse
} from '@server/shared';
// Remove GatewayAuthGuard import if unused
import { Request } from 'express';
import { UserRole, Requester } from '@workspace/schemas';

interface RequestWithUser extends Request {
    user: Requester;
}

@Controller('api/courses')
@UseGuards(GatewayAuthGuard, RolesGuard)
export class CourseController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    @HttpCode(HttpStatus.CREATED)
    async createCourse(@Body() dto: any, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.create' },
                { ...dto, instructorId: user.sub, userRole: user.role }
            )
        );
        return successResponse({ course: result }, 'Course created successfully');
    }

    @Get('categories')
    async getCategories() {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.category.findAll' }, {})
        );
        return successResponse({ categories: result });
    }

    @Get('advanced-search')
    async advancedSearch(@Query() query: any) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.course.advancedSearch' }, query)
        );
        return successPaginatedResponse(result);
    }

    @Get('by-type/:type')
    async getByType(@Param('type') type: 'vod' | 'live') {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.course.getByType' }, { type })
        );
        return successResponse({ courses: result });
    }

    @Get()
    async getCourses(@Query() query: any) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.course.findAll' }, query)
        );
        return successPaginatedResponse(result);
    }

    @Get(':id')
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
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    async updateCourse(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req: RequestWithUser
    ) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.update' },
                { id, ...dto, userId: user.sub, userRole: user.role }
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
                { id, userId: user.sub, userRole: user.role }
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
    async getCurriculum(@Param('id') id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.course.getCurriculum' }, { id })
        );
        return successResponse(result);
    }

    @Post(':id/unpublish')
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    async unpublishCourse(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.unpublish' },
                { id, userId: user.sub, userRole: user.role }
            )
        );
        return successResponse({ course: result }, 'Course unpublished successfully');
    }

    @Post(':id/publish')
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    async publishCourse(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.course.publish' },
                { id, userId: user.sub, userRole: user.role }
            )
        );
        return successResponse({ course: result }, 'Course published successfully');
    }
}
