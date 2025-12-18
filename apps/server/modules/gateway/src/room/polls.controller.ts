import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreatePollReq,
  SubmitPollResponseReq,
  ClosePollReq,
} from '@workspace/protocol';

@Controller('polls')
export class PollsController {
  constructor(
    @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
  ) {}

  @Post('create')
  async create(@Body() body: CreatePollReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.create' }, body));
  }

  @Post('list')
  async list(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.list' }, body));
  }

  @Post('close')
  async close(@Body() body: ClosePollReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.close' }, body));
  }

  @Post('submit')
  async submit(@Body() body: SubmitPollResponseReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.submit' }, body));
  }

  @Post('stats')
  async stats(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.stats' }, body));
  }
}

