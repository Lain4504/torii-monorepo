import { Body, Controller, Inject, Post, Get, Param, HttpCode } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateRoomReq, RoomEndAPIReq } from '@workspace/protocol';


@Controller('auth/room')
export class RoomController {
  constructor(
    @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
  ) { }

  @Post('create')
  @HttpCode(200)

  async create(@Body() body: CreateRoomReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.create' }, body));
  }

  @Post('end')
  @HttpCode(200)

  async end(@Body() body: RoomEndAPIReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.end' }, body));
  }

  @Post('isRoomActive')
  @HttpCode(200)

  async isRoomActive(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.isRoomActive' }, body));
  }

  @Post('getJoinToken')
  @HttpCode(200)

  async getJoinToken(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.getJoinToken' }, body));
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

