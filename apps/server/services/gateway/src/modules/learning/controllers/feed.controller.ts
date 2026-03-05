import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  successResponse,
  errorResponse,
  successPaginatedResponse,
  Public,
  GatewayAuthGuard,
  ReqWithRequester,
} from '@server/shared';

@Controller('api/feed')
@UseGuards(GatewayAuthGuard)
export class FeedController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Public()
  @Get()
  async findAll(@Query() query: any, @Req() req: ReqWithRequester) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send('feed.findAll', { query, userId: requester?.sub }),
      );
      return successPaginatedResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch Feeds');
    }
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: ReqWithRequester) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send('feed.findById', { id, userId: requester?.sub }),
      );
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch Feed');
    }
  }

  @Post()
  async create(@Body() dto: any, @Req() req: ReqWithRequester) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send('feed.create', { dto, userId: requester?.sub }),
      );
      return successResponse(result, 'Feed created successfully');
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to create Feed');
    }
  }

  @Post(':id/like')
  async toggleLike(@Param('id') id: string, @Req() req: ReqWithRequester) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send('feed.toggleLike', { id, userId: requester?.sub }),
      );
      return successResponse(result, 'Like toggled successfully');
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to toggle like');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: ReqWithRequester) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send('feed.delete', { id, userId: requester?.sub }),
      );
      return successResponse(result, 'Feed deleted successfully');
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to delete Feed');
    }
  }
}
