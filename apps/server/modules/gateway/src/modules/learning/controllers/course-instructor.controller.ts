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
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/course-instructors')
@UseGuards(GatewayAuthGuard)
export class CourseInstructorController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async assignLecturer(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course-instructor.assign' },
                    { ...dto, userId: requester.sub }
                )
            );
            return successResponse(result, 'Lecturer assigned successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to assign lecturer');
        }
    }

    @Get('by-course/:courseId')
    async getInstructorsByCourse(@Param('courseId') courseId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course-instructor.getByCourse' },
                    { courseId }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch course instructors');
        }
    }

    @Get('by-lecturer/:lecturerId')
    async getCoursesByLecturer(@Param('lecturerId') lecturerId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course-instructor.getByLecturer' },
                    { lecturerId }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch lecturer courses');
        }
    }

    @Patch(':id/primary')
    async updatePrimaryInstructor(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course-instructor.updatePrimary' },
                    { id, ...dto, userId: requester.sub, userRole: requester.role, userPermissions: requester.permissions }
                )
            );
            return successResponse(result, 'Primary instructor updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update primary instructor');
        }
    }

    @Delete(':id')
    async unassignLecturer(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course-instructor.unassign' },
                    { id, userId: requester.sub, userRole: requester.role, userPermissions: requester.permissions }
                )
            );
            return successResponse(result, 'Lecturer unassigned successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to unassign lecturer');
        }
    }
}
