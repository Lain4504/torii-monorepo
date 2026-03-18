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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  ZodValidationPipe,
  successResponse,
  ReqWithRequester,
} from '@server/shared';
import {
  academyEnrollmentCreateDTOSchema,
  academyEnrollmentQueryDTOSchema,
  academyEnrollmentUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/enrollments')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class EnrollmentController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(academyEnrollmentQueryDTOSchema)) query: any,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.enrollment.findAll' }, query),
    );
    return successResponse(result);
  }

  @Get('me')
  async findMyEnrollments(@Req() req: ReqWithRequester, @Query() query: any) {
    const requester = req.requester;
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.enrollment.findAll' },
        { ...query, userId: requester.sub },
      ),
    );
    if (Array.isArray(result)) {
      return successResponse({
        items: result,
        total: result.length,
        page: 1,
        limit: result.length || 1,
        totalPages: 1,
      });
    }
    return successResponse(result);
  }

  @Get('stats')
  async getStats(@Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.enrollment.getStats' },
        { userId: req.requester?.sub },
      ),
    );
    return successResponse(result);
  }

  @Get(':id')
  @Permissions('academy.delivery.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.enrollment.findById' }, { id }),
    );
    return successResponse(result);
  }

  @Post()
  @Permissions('academy.delivery.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyEnrollmentCreateDTOSchema)) dto: any,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.enrollment.create' },
        { ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(result);
  }

  @Put(':id')
  @Permissions('academy.delivery.write')
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyEnrollmentUpdateDTOSchema)) dto: any,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.enrollment.updateStatus' },
        { id, ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(result);
  }

  @Delete(':id')
  @Permissions('academy.delivery.write')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.enrollment.delete' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(result);
  }
}
