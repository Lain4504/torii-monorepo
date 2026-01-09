import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UsePipes,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Request,
    Inject,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZodValidationPipe, GatewayAuthGuard } from '@server/shared';
import { lessonMaterialCreateDTOSchema, lessonMaterialUpdateDTOSchema } from '@workspace/schemas';
import type {
    LessonMaterialResponseDTO,
    LessonMaterialCreateDTO,
    LessonMaterialUpdateDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { ILessonMaterialService } from '../interfaces/services';
import { LESSON_MATERIAL_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Lesson Material HTTP Controller
 * Handles lesson material upload and management
 */
@Controller('lesson-materials')
@UseGuards(GatewayAuthGuard)
export class LessonMaterialController {
    constructor(
        @Inject(LESSON_MATERIAL_SERVICE_TOKEN)
        private readonly lessonMaterialService: ILessonMaterialService
    ) { }

    /**
     * Upload lesson material
     */
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @UsePipes(new ZodValidationPipe(lessonMaterialCreateDTOSchema))
    async uploadMaterial(
        @Request() req: ReqWithRequester,
        @Body() dto: LessonMaterialCreateDTO,
        @UploadedFile() file: Express.Multer.File
    ): Promise<LessonMaterialResponseDTO> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        return this.lessonMaterialService.uploadMaterial(
            req.requester,
            dto,
            file.buffer,
            file.originalname,
            file.mimetype
        );
    }

    /**
     * Get all materials for a lesson
     */
    @Get('by-lesson/:lessonId')
    async getMaterialsByLesson(
        @Param('lessonId') lessonId: string
    ): Promise<LessonMaterialResponseDTO[]> {
        return this.lessonMaterialService.findByLessonId(lessonId);
    }

    /**
     * Update material metadata
     */
    @Patch(':id')
    @UsePipes(new ZodValidationPipe(lessonMaterialUpdateDTOSchema))
    async updateMaterial(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body() dto: LessonMaterialUpdateDTO
    ): Promise<LessonMaterialResponseDTO> {
        return this.lessonMaterialService.updateMaterial(req.requester, id, dto);
    }

    /**
     * Delete material
     */
    @Delete(':id')
    async deleteMaterial(
        @Request() req: ReqWithRequester,
        @Param('id') id: string
    ): Promise<{ message: string }> {
        return this.lessonMaterialService.deleteMaterial(req.requester, id);
    }
}
