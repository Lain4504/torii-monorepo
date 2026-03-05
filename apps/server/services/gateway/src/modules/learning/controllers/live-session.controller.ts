import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Inject,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  PermissionsGuard,
  Permissions,
  successResponse,
  ReqWithRequester,
  Public,
} from '@server/shared';

@Controller('api/live-sessions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LiveSessionController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  @Permissions('live_class.schedule')
  async create(@Body() dto: any, @Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.create' },
        {
          ...dto,
          requester: req.requester,
        },
      ),
    );
    return successResponse(result, 'Live session created successfully');
  }

  @Patch(':id')
  @Permissions('live_class.schedule')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.update' },
        {
          id,
          ...dto,
          requester: req.requester,
        },
      ),
    );
    return successResponse(result, 'Live session updated successfully');
  }

  @Get('run/:courseRunId')
  @Public()
  async findByRun(@Param('courseRunId') courseRunId: string) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.findByRunId' },
        { courseRunId },
      ),
    );
    return successResponse(result);
  }

  @Get('run/:courseRunId/active')
  @Public()
  async findActiveByRun(@Param('courseRunId') courseRunId: string) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.findActiveByRunId' },
        { courseRunId },
      ),
    );
    return successResponse(result);
  }

  @Get('course/:courseMasterId')
  @Public()
  async findByCourse(@Param('courseMasterId') courseMasterId: string) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.findByCourseId' },
        { courseMasterId },
      ),
    );
    return successResponse(result);
  }

  @Get('course/:courseMasterId/active')
  @Public()
  async findActiveByCourse(@Param('courseMasterId') courseMasterId: string) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.findActiveByCourseId' },
        { courseMasterId },
      ),
    );
    return successResponse(result);
  }

  @Get(':id')
  @Public()
  async findById(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.natsClient.send({ cmd: 'learning.liveSession.findById' }, { id }),
    );
    return successResponse(result);
  }

  @Delete(':id')
  @Permissions('live_class.schedule')
  async delete(@Param('id') id: string, @Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.delete' },
        {
          id,
          requester: req.requester,
        },
      ),
    );
    return successResponse(result, 'Live session deleted successfully');
  }

  @Post(':id/start')
  @Permissions('live_class.manage')
  async start(@Param('id') id: string, @Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.start' },
        {
          id,
          requester: req.requester,
        },
      ),
    );
    return successResponse(result, 'Live session started');
  }

  @Post(':id/end')
  @Permissions('live_class.manage')
  async end(@Param('id') id: string, @Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.end' },
        {
          id,
          requester: req.requester,
        },
      ),
    );
    return successResponse(result, 'Live session ended');
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'learning.liveSession.join' },
        {
          id,
          requester: req.requester,
        },
      ),
    );
    return successResponse(result);
  }
}
