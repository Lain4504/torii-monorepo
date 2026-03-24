import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  Public,
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  ZodValidationPipe,
  successResponse,
  successPaginatedResponse,
  ReqWithRequester,
} from '@server/shared';
import {
  AcademyVodPackageCreateDTO,
  AcademyVodPackageQueryDTO,
  AcademyVodPackageUpdateDTO,
  academyVodPackageCreateDTOSchema,
  academyVodPackageQueryDTOSchema,
  academyVodPackageUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/vod-packages')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class VodPackageController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Public()
  @Get('public')
  async findAllPublic(
    @Query(new ZodValidationPipe(academyVodPackageQueryDTOSchema))
    query: AcademyVodPackageQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.vod.findAll' },
        { ...query, status: 'PUBLISHED' },
      ),
    );
    return successResponse(items);
  }

  @Public()
  @Get('public/:id')
  async findByIdPublic(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.vod.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Get()
  @Permissions('academy.commerce.read')
  async findAll(
    @Query(new ZodValidationPipe(academyVodPackageQueryDTOSchema))
    query: AcademyVodPackageQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.vod.findAll' }, query),
    );
    return successResponse(items);
  }

  @Get(':id')
  @Permissions('academy.commerce.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.vod.findById' }, { id }),
    );
    return successResponse(item);
  }

  @Post()
  @Permissions('academy.commerce.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyVodPackageCreateDTOSchema))
    dto: AcademyVodPackageCreateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.vod.create' },
        { ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(item);
  }

  @Put(':id')
  @Permissions('academy.commerce.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyVodPackageUpdateDTOSchema))
    dto: AcademyVodPackageUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.vod.update' },
        { id, input: dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(item);
  }

  @Delete(':id')
  @Permissions('academy.commerce.write')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.vod.delete' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(result);
  }

  @Get(':id/orders')
  @Permissions('academy.commerce.read')
  async findOrders(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: any,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.order.admin.findByOffering' },
        { offeringId: id, query },
      ),
    );
    return successPaginatedResponse(result);
  }

  @Get(':id/stats')
  @Permissions('academy.commerce.read')
  async getStats(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.order.admin.getStatsByOffering' },
        { offeringId: id },
      ),
    );
    return successResponse(result);
  }

  @Post(':id/approve')
  @Permissions('academy.commerce.write')
  async approve(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.vod.update' },
        { id, input: { status: 'PUBLISHED' } },
      ),
    );
    return successResponse(item);
  }

  @Post(':id/reject')
  @Permissions('academy.commerce.write')
  async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { reason: string },
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.vod.update' },
        { id, input: { status: 'DRAFT', rejectionReason: body.reason } },
      ),
    );
    return successResponse(item);
  }
}
