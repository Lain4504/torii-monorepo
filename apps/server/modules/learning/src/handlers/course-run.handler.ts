import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { COURSE_RUN_SERVICE_TOKEN, ICourseRunService } from '@server/learning/interfaces/services';
import { CourseRunCreateDTO, CourseRunUpdateDTO, Requester, CourseRunSearchRequestDTO } from '@workspace/schemas';

@Controller()
export class CourseRunHandler {
    constructor(
        @Inject(COURSE_RUN_SERVICE_TOKEN)
        private readonly courseRunService: ICourseRunService,
    ) { }

    @MessagePattern({ cmd: 'learning.courserun.create' })
    async create(@Payload() data: CourseRunCreateDTO & { requester: Requester }) {
        const { requester, ...dto } = data;
        return this.courseRunService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.courserun.update' })
    async update(@Payload() data: CourseRunUpdateDTO & { id: string, requester: Requester }) {
        const { id, requester, ...dto } = data;
        return this.courseRunService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.courserun.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.courseRunService.findById(data.id);
    }

    @MessagePattern({ cmd: 'learning.courserun.findAll' })
    async findAll(@Payload() query: CourseRunSearchRequestDTO) {
        return this.courseRunService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.courserun.delete' })
    async delete(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseRunService.delete(requester, id);
    }
}
