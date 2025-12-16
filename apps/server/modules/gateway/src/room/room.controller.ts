import { Body, Controller, Inject, Post, Get, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateRoomReq, RoomEndAPIReq } from '@server/proto';

@Controller('room')
export class RoomController {
  constructor(
    @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
  ) {}

  @Post('create')
  async create(@Body() body: CreateRoomReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.create' }, body));
  }

  @Post('end')
  async end(@Body() body: RoomEndAPIReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.end' }, body));
  }

  @Get(':roomName')
  async status(@Param('roomName') roomName: string) {
    return firstValueFrom(
      this.roomClient.send({ cmd: 'room.status' }, { roomName }),
    );
  }

  @Get('list/active')
  async list() {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.list' }, {}));
  }
}
