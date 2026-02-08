import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { COURSE_INSTRUCTOR_SERVICE_TOKEN, ICourseInstructorService } from '../../interfaces/services';
import { CourseInstructorAssignDTO, CourseInstructorUpdateDTO } from '@workspace/schemas';

@Controller()
export class CourseInstructorHandler {
    constructor(
        @Inject(COURSE_INSTRUCTOR_SERVICE_TOKEN) private readonly courseInstructorService: ICourseInstructorService
    ) { }

    @MessagePattern({ cmd: 'learning.course-instructor.assign' })
    async assignLecturer(@Payload() data: CourseInstructorAssignDTO & { userId: string }) {
        const { userId, ...dto } = data;
        const requester = { sub: userId, role: 'STAFF' as any, permissions: [] };
        return this.courseInstructorService.assignLecturer(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.course-instructor.getByCourse' })
    async getInstructorsByCourse(@Payload() data: { courseId: string }) {
        return this.courseInstructorService.getInstructorsByCourse(data.courseId);
    }

    @MessagePattern({ cmd: 'learning.course-instructor.getByLecturer' })
    async getCoursesByLecturer(@Payload() data: { lecturerId: string }) {
        return this.courseInstructorService.getCoursesByLecturer(data.lecturerId);
    }

    @MessagePattern({ cmd: 'learning.course-instructor.updatePrimary' })
    async updatePrimaryInstructor(@Payload() data: CourseInstructorUpdateDTO & { id: string, userId: string, userRole: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userPermissions, ...dto } = data;
        const requester = { sub: userId, role: userRole as any, permissions: userPermissions || [] };
        return this.courseInstructorService.updatePrimaryInstructor(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.course-instructor.unassign' })
    async unassignLecturer(@Payload() data: { id: string, userId: string, userRole: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userPermissions } = data;
        const requester = { sub: userId, role: userRole as any, permissions: userPermissions || [] };
        return this.courseInstructorService.unassignLecturer(requester, id);
    }
}
