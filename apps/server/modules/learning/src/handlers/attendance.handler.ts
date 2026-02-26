import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ATTENDANCE_SERVICE_TOKEN, IAttendanceService } from '@server/learning/interfaces/services';
import { AttendanceCreateDTO, AttendanceQueryDTO, AttendanceUpdateDTO } from '@workspace/schemas';

@Controller()
export class AttendanceHandler {
    constructor(
        @Inject(ATTENDANCE_SERVICE_TOKEN) private readonly attendanceService: IAttendanceService
    ) { }

    @MessagePattern({ cmd: 'learning.attendance.create' })
    async create(@Payload() dto: AttendanceCreateDTO) {
        return this.attendanceService.create(dto);
    }

    @MessagePattern({ cmd: 'learning.attendance.update' })
    async update(@Payload() data: { id: string; dto: AttendanceUpdateDTO }) {
        return this.attendanceService.update(data.id, data.dto);
    }

    @MessagePattern({ cmd: 'learning.attendance.findById' })
    async findById(@Payload() id: string) {
        return this.attendanceService.findById(id);
    }

    @MessagePattern({ cmd: 'learning.attendance.findAll' })
    async findAll(@Payload() query: AttendanceQueryDTO) {
        return this.attendanceService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.attendance.mark' })
    async mark(@Payload() data: { liveSessionId: string; userId: string; status: string }) {
        return this.attendanceService.markAttendance(data.liveSessionId, data.userId, data.status);
    }
}
