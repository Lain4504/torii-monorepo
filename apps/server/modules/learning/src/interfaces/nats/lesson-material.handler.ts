import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LESSON_MATERIAL_SERVICE_TOKEN, ILessonMaterialService } from '../../interfaces/services';
import { LessonMaterialCreateDTO, LessonMaterialUpdateDTO } from '@workspace/schemas';

@Controller()
export class LessonMaterialHandler {
    constructor(
        @Inject(LESSON_MATERIAL_SERVICE_TOKEN) private readonly lessonMaterialService: ILessonMaterialService
    ) { }

    @MessagePattern({ cmd: 'learning.lesson-material.upload' })
    async upload(@Payload() data: {
        dto: LessonMaterialCreateDTO,
        fileId: string,
        userId: string,
        userRole: string,
        userPermissions?: string[]
    }) {
        const { dto, fileId, userId, userRole, userPermissions } = data;
        const requester = { sub: userId, role: userRole as any, permissions: userPermissions || [] };

        return this.lessonMaterialService.uploadMaterial(
            requester,
            dto,
            fileId
        );
    }

    @MessagePattern({ cmd: 'learning.lesson-material.findByLessonId' })
    async findByLessonId(@Payload() data: { lessonId: string }) {
        return this.lessonMaterialService.findByLessonId(data.lessonId);
    }

    @MessagePattern({ cmd: 'learning.lesson-material.update' })
    async update(@Payload() data: LessonMaterialUpdateDTO & { id: string, userId: string, userRole: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userPermissions, ...dto } = data;
        const requester = { sub: userId, role: userRole as any, permissions: userPermissions || [] };
        return this.lessonMaterialService.updateMaterial(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson-material.delete' })
    async delete(@Payload() data: { id: string, userId: string, userRole: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userPermissions } = data;
        const requester = { sub: userId, role: userRole as any, permissions: userPermissions || [] };
        return this.lessonMaterialService.deleteMaterial(requester, id);
    }
}
