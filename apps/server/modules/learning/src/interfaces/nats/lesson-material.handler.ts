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
        file: { buffer: any, originalname: string, mimetype: string }, // Buffer sent as object or base64 
        userId: string
    }) {
        const { dto, file, userId } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };

        // Convert buffer back if it's sent as Buffer-like object
        const buffer = Buffer.from(file.buffer);

        return this.lessonMaterialService.uploadMaterial(
            requester,
            dto,
            buffer,
            file.originalname,
            file.mimetype
        );
    }

    @MessagePattern({ cmd: 'learning.lesson-material.findByLessonId' })
    async findByLessonId(@Payload() data: { lessonId: string }) {
        return this.lessonMaterialService.findByLessonId(data.lessonId);
    }

    @MessagePattern({ cmd: 'learning.lesson-material.update' })
    async update(@Payload() data: LessonMaterialUpdateDTO & { id: string, userId: string }) {
        const { id, userId, ...dto } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.lessonMaterialService.updateMaterial(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson-material.delete' })
    async delete(@Payload() data: { id: string, userId: string }) {
        const { id, userId } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.lessonMaterialService.deleteMaterial(requester, id);
    }
}
