import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreatePollReq,
  SubmitPollResponseReq,
  ClosePollReq,
} from '@workspace/protocol';

@Controller('api/polls')
export class PollsController {
  constructor(
    @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
  ) { }

  @Post('create')
  async create(@Body() body: CreatePollReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.create' }, body));
  }

  // POST endpoint (legacy/internal)
  @Post('list')
  async list(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.list' }, body));
  }

  // GET endpoint (client-facing) - matches plugNmeet-client
  @Get('listPolls')
  async listPolls() {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.list' }, {}));
  }

  @Post('close')
  async close(@Body() body: ClosePollReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.close' }, body));
  }

  // Match client endpoint name
  @Post('closePoll')
  async closePoll(@Body() body: ClosePollReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.close' }, body));
  }

  @Post('submit')
  async submit(@Body() body: SubmitPollResponseReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.submit' }, body));
  }

  // Match client endpoint name
  @Post('submitResponse')
  async submitResponse(@Body() body: SubmitPollResponseReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.submit' }, body));
  }

  @Post('stats')
  async stats(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.stats' }, body));
  }

  // GET endpoint (client-facing)
  @Get('pollsStats')
  async pollsStats() {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.stats' }, {}));
  }

  // Client GET endpoints for poll details
  @Get('countTotalResponses/:pollId')
  async countTotalResponses(@Param('pollId') pollId: string) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.countResponses' }, { pollId }));
  }

  @Get('userSelectedOption/:pollId/:userId')
  async userSelectedOption(
    @Param('pollId') pollId: string,
    @Param('userId') userId: string,
  ) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.userOption' }, { pollId, userId }));
  }

  @Get('pollResponsesDetails/:pollId')
  async pollResponsesDetails(@Param('pollId') pollId: string) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.responsesDetails' }, { pollId }));
  }

  @Get('pollResponsesResult/:pollId')
  async pollResponsesResult(@Param('pollId') pollId: string) {
    return firstValueFrom(this.roomClient.send({ cmd: 'poll.responsesResult' }, { pollId }));
  }
}

