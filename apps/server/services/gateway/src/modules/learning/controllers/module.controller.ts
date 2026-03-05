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
  ZodValidationPipe,
} from '@server/shared';
import {
  ModuleSearchRequestDTO,
  moduleSearchRequestDTOSchema,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';

@Controller('api/modules')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ModuleController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post('search')
  @Permissions('course.view_restricted', 'course.view_my')
  async searchModules(
    @Body(new ZodValidationPipe(moduleSearchRequestDTOSchema))
    dto: ModuleSearchRequestDTO,
  ) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'learning.module.findAll' }, dto),
      );
      return successPaginatedResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to search modules');
    }
  }

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
          { page, limit, search },
        ),
      );
      return successPaginatedResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch modules');
    }
  }

  @Get('by-course/:courseMasterId')
  async findByCourseId(
    @Param('courseMasterId') courseMasterId: string,
    @Req() req: ReqWithRequester,
  ) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'learning.module.findByCourseId' },
          { courseMasterId, requester: req.requester },
        ),
      );
      return successResponse({ modules: result });
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch course modules');
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'learning.module.findById' }, { id }),
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
          { ...dto, requester: req.requester },
        ),
      );
      return successResponse({ module: result }, 'Module created successfully');
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to create module');
    }
  }

  @Post('reorder/:courseMasterId')
  @Permissions('module.update')
  async reorder(
    @Param('courseMasterId') courseMasterId: string,
    @Body() moduleOrders: { id: string; orderIndex: number }[],
    @Req() req: ReqWithRequester,
  ) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'learning.module.reorder' },
          { courseMasterId, moduleOrders, requester: req.requester },
        ),
      );
      return successResponse(
        { modules: result },
        'Modules reordered successfully',
      );
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to reorder modules');
    }
  }

  @Patch(':id')
  @Permissions('module.update')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: ReqWithRequester,
  ) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'learning.module.update' },
          { id, ...dto, requester: req.requester },
        ),
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
    @Req() req: ReqWithRequester,
  ) {
    try {
      const requester = req.requester;
      const isHardDelete = hardDelete === 'true';
      await firstValueFrom(
        this.natsClient.send(
          { cmd: 'learning.module.delete' },
          { id, hardDelete: isHardDelete, requester: req.requester },
        ),
      );
      return successResponse(null, 'Module deleted successfully');
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to delete module');
    }
  }
}
