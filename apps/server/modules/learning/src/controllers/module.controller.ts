import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UsePipes,
    UseGuards,
    Request,
    Inject,
} from '@nestjs/common';
import { ZodValidationPipe, GatewayAuthGuard } from '@server/shared';
import { moduleCreateDTOSchema, moduleUpdateDTOSchema } from '@workspace/schemas';
import type {
    ModuleResponseDTO,
    ModuleCreateDTO,
    ModuleUpdateDTO,
    PaginatedResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { IModuleService } from '../interfaces/services';
import { MODULE_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Module HTTP Controller
 * Handles course module management operations
 */
@Controller('modules')
@UseGuards(GatewayAuthGuard)
export class ModuleController {
    constructor(@Inject(MODULE_SERVICE_TOKEN) private readonly moduleService: IModuleService) { }

    /**
     * Get all modules with pagination
     */
    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ): Promise<PaginatedResponseDTO<ModuleResponseDTO>> {
        return this.moduleService.findAll({
            page: Number(page),
            limit: Number(limit),
            search,
        });
    }

    /**
     * Get all modules for a course
     */
    @Get('by-course/:courseId')
    async findByCourseId(@Param('courseId') courseId: string): Promise<ModuleResponseDTO[]> {
        return this.moduleService.findByCourseId(courseId);
    }

    /**
     * Get module by ID
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ModuleResponseDTO> {
        return this.moduleService.findOne(id);
    }

    /**
     * Create new module
     */
    @Post()
    @UsePipes(new ZodValidationPipe(moduleCreateDTOSchema))
    async create(
        @Request() req: ReqWithRequester,
        @Body() dto: ModuleCreateDTO
    ): Promise<ModuleResponseDTO> {
        return this.moduleService.create(req.requester, dto);
    }

    /**
     * Reorder modules in a course
     */
    @Post('reorder/:courseId')
    async reorder(
        @Request() req: ReqWithRequester,
        @Param('courseId') courseId: string,
        @Body() moduleOrders: { id: string; orderIndex: number }[],
    ): Promise<{ message: string }> {
        return this.moduleService.reorder(req.requester, courseId, moduleOrders);
    }

    /**
     * Update module
     */
    @Patch(':id')
    @UsePipes(new ZodValidationPipe(moduleUpdateDTOSchema))
    async update(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body() dto: ModuleUpdateDTO,
    ): Promise<ModuleResponseDTO> {
        return this.moduleService.update(req.requester, id, dto);
    }

    /**
     * Delete module
     */
    @Delete(':id')
    async delete(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string,
    ): Promise<{ message: string }> {
        const isHardDelete = hardDelete === 'true';
        return this.moduleService.delete(req.requester, id, isHardDelete);
    }
}
