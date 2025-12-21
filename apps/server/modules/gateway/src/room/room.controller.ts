import {
  Body,
  Controller,
  Inject,
  Post,
  HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { CreateRoomReq, RoomEndAPIReq, GenerateTokenReq, GetActiveRoomInfoReq, IsRoomActiveReq, FetchPastRoomsReq } from '@workspace/protocol';
import { CreateRoomReqSchema, RoomEndAPIReqSchema, GenerateTokenReqSchema, GetActiveRoomInfoReqSchema, IsRoomActiveReqSchema, FetchPastRoomsReqSchema } from '@workspace/protocol';
import { ProtobufParserPipe } from '@server/shared';

@Controller('auth/room')
export class RoomController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Post('create')
  @HttpCode(200)
  async create(@Body(new ProtobufParserPipe(CreateRoomReqSchema)) body: CreateRoomReq) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.create' }, body));
  }

  @Post('endRoom')
  @HttpCode(200)
  async endRoom(@Body(new ProtobufParserPipe(RoomEndAPIReqSchema)) body: RoomEndAPIReq) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.end' }, body));
  }

  @Post('isRoomActive')
  @HttpCode(200)
  async isRoomActive(@Body(new ProtobufParserPipe(IsRoomActiveReqSchema)) body: IsRoomActiveReq) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'room.isRoomActive' }, body),
    );
  }

  @Post('getJoinToken')
  @HttpCode(200)
  async getJoinToken(@Body(new ProtobufParserPipe(GenerateTokenReqSchema)) body: GenerateTokenReq) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'room.getJoinToken' }, body),
    );
  }


  @Post('getActiveRoomInfo')
  async getActiveRoomInfo(@Body(new ProtobufParserPipe(GetActiveRoomInfoReqSchema)) body: GetActiveRoomInfoReq) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.getActiveRoomInfo' }, body));
  }

  @Post('getActiveRoomsInfo')
  async getActiveRoomsInfo() {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.getActiveRoomsInfo' }, {}));
  }

  @Post('fetchPastRooms')
  async fetchPastRooms(@Body(new ProtobufParserPipe(FetchPastRoomsReqSchema)) body: FetchPastRoomsReq) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.fetchPastRooms' }, body));
  }

  @Post('changeVisibility')
  @HttpCode(200)
  async changeVisibility(@Body() body: { roomId: string; visible: boolean }) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'room.changeVisibility' }, body),
    );
  }

}
