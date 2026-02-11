import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
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
    successPaginatedResponse,
    Permissions,
    PermissionsGuard,
    ReqWithRequester,
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';

@Controller('api/modules')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ModuleController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.module.findAll' },
                    { page, limit, search }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch modules');
        }
    }

    @Get('by-course/:courseId')
    async findByCourseId(
        @Param('courseId') courseId: string,
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.module.findByCourseId' },
                    { courseId, userId: requester.sub }
                )
            );
            return successResponse({ modules: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch course modules');
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'learning.module.findOne' }, { id })
            );
            return successResponse({ module: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch module');
        }
    }

    @Post()
    @Permissions('module.create')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.module.create' },
                    { ...dto, userId: requester.sub }
                )
            );
            return successResponse({ module: result }, 'Module created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create module');
        }
    }

    @Post('reorder/:courseId')
    @Permissions('module.update')
    async reorder(
        @Param('courseId') courseId: string,
        @Body() moduleOrders: { id: string; orderIndex: number }[],
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.module.reorder' },
                    { courseId, moduleOrders, userId: requester.sub, userRole: requester.role, userPermissions: requester.permissions }
                )
            );
            return successResponse({ modules: result }, 'Modules reordered successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to reorder modules');
        }
    }

    @Patch(':id')
    @Permissions('module.update')
    async update(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.module.update' },
                    { id, ...dto, userId: requester.sub, userRole: requester.role, userPermissions: requester.permissions }
                )
            );
            return successResponse({ module: result }, 'Module updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update module');
        }
    }

    @Delete(':id')
    @Permissions('module.delete')
    async delete(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete: string,
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const isHardDelete = hardDelete === 'true';
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.module.delete' },
                    { id, userId: requester.sub, userRole: requester.role, hardDelete: isHardDelete, userPermissions: requester.permissions }
                )
            );
            return successResponse(null, 'Module deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete module');
        }
    }
}
