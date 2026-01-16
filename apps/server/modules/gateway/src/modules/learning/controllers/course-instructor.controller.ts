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
    errorResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('api/course-instructors')
@UseGuards(IdentityAuthGuard)
export class CourseInstructorController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async assignLecturer(@Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course-instructor.assign' },
                    { ...dto, userId: user.sub }
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
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course-instructor.updatePrimary' },
                    { id, ...dto, userId: user.sub }
                )
            );
            return successResponse(result, 'Primary instructor updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update primary instructor');
        }
    }

    @Delete(':id')
    async unassignLecturer(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.course-instructor.unassign' },
                    { id, userId: user.sub }
                )
            );
            return successResponse(result, 'Lecturer unassigned successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to unassign lecturer');
        }
    }
}
