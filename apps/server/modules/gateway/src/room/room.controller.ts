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
import { CreateRoomReq, RoomEndAPIReq } from '@workspace/protocol';
import { BypassTransform } from '@server/shared';

@Controller('auth/room')
export class RoomController {
  constructor(
    @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
  ) { }

  @Post('create')
  @HttpCode(200)
  @BypassTransform()
  async create(@Body() body: CreateRoomReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.create' }, body));
  }

  @Post('endRoom')
  @HttpCode(200)
  @BypassTransform()
  async endRoom(@Body() body: RoomEndAPIReq) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.end' }, body));
  }

  @Post('isRoomActive')
  @HttpCode(200)
  @BypassTransform()
  async isRoomActive(@Body() body: any) {
    return firstValueFrom(
      this.roomClient.send({ cmd: 'room.isRoomActive' }, body),
    );
  }

  @Post('getJoinToken')
  @HttpCode(200)
  @BypassTransform()
  async getJoinToken(@Body() body: any) {
    return firstValueFrom(
      this.roomClient.send({ cmd: 'room.getJoinToken' }, body),
    );
  }

  @Get(':roomName')
  async status(@Param('roomName') roomName: string) {
    return firstValueFrom(
      this.roomClient.send({ cmd: 'room.status' }, { roomName }),
    );
  }

  @Post('getActiveRoomInfo')
  @BypassTransform()
  async getActiveRoomInfo(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.getActiveRoomInfo' }, body));
  }

  @Post('getActiveRoomsInfo')
  @BypassTransform()
  async getActiveRoomsInfo(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.getActiveRoomsInfo' }, body));
  }

  @Post('fetchPastRooms')
  @BypassTransform()
  async fetchPastRooms(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.fetchPastRooms' }, body));
  }

  @Get('list/active')
  async list() {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.list' }, {}));
  }
}
