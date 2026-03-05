import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  successPaginatedResponse,
  errorResponse,
} from '@server/shared';

@Controller('api/admin/enrollments')
@UseGuards(GatewayAuthGuard)
export class EnrollmentAdminController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Get()
  async findAll(@Query() query: any) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'learning.enrollment-admin.findAll' },
          query,
        ),
      );
      return successPaginatedResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch enrollments');
    }
  }

  @Get('users/:userId')
  async findByUser(@Param('userId') userId: string, @Query() query: any) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'learning.enrollment-admin.findByUser' },
          { userId, query },
        ),
      );
      return successPaginatedResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch user enrollments');
    }
  }
}
