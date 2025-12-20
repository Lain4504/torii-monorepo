import {
  Body,
  Controller,
  Inject,
  Post,
  Get,
  Param,
  HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { CreateRoomReq, RoomEndAPIReq } from '@workspace/protocol';

@Controller('auth/room')
export class RoomController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Post('create')
  @HttpCode(200)
  async create(@Body() body: CreateRoomReq) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.create' }, body));
  }

  @Post('endRoom')
  @HttpCode(200)
  async endRoom(@Body() body: RoomEndAPIReq) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.end' }, body));
  }

  @Post('isRoomActive')
  @HttpCode(200)
  async isRoomActive(@Body() body: any) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'room.isRoomActive' }, body),
    );
  }

  @Post('getJoinToken')
  @HttpCode(200)
  async getJoinToken(@Body() body: any) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'room.getJoinToken' }, body),
    );
  }

  @Get(':roomName')
  async status(@Param('roomName') roomName: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'room.status' }, { roomName }),
    );
  }

  @Post('getActiveRoomInfo')
  async getActiveRoomInfo(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.getActiveRoomInfo' }, body));
  }

  @Post('getActiveRoomsInfo')
  async getActiveRoomsInfo(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.getActiveRoomsInfo' }, body));
  }

  @Post('fetchPastRooms')
  async fetchPastRooms(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.fetchPastRooms' }, body));
  }

  @Get('list/active')
  async list() {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.list' }, {}));
  }
}
