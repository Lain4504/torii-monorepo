import {
  Body,
  Controller,
  Inject,
  Post,
  HttpCode,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { CreateRoomReq, RoomEndAPIReq, GenerateTokenReq, GetActiveRoomInfoReq, IsRoomActiveReq, FetchPastRoomsReq, ChangeVisibilityRes } from '@workspace/protocol';
import { CreateRoomReqSchema, RoomEndAPIReqSchema, RoomEndResSchema, GenerateTokenReqSchema, GetActiveRoomInfoReqSchema, IsRoomActiveReqSchema, FetchPastRoomsReqSchema, ChangeVisibilityResSchema } from '@workspace/protocol';
import { ProtobufParserPipe } from '@server/shared';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

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
}

@Controller('api')
@UseGuards(JwtAuthGuard)
export class RoomApiController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  private decode<T>(req: any, body: any, schema: any): T {
    const raw = req?.body;
    if (raw && Buffer.isBuffer(raw) && raw.length > 0) {
      try {
        return fromBinary(schema, raw) as T;
      } catch { /* fall back */ }
    }
    return body as T;
  }

  private getAuthContext(req: any) {
    const user = req.user || {};
    const roomId = user.room_id || user.room || user.video?.room;
    const userId = user.user_id || user.userId || user.sub;
    const isAdmin = user.is_admin ?? user.isAdmin ?? user.metadata?.is_admin ?? user.metadata?.isAdmin ?? false;
    return { roomId, userId, isAdmin };
  }

  @Post('endRoom')
  @HttpCode(200)
  async endRoom(@Body() body: RoomEndAPIReq, @Req() req: any, @Res() res: any) {
    const { roomId, isAdmin } = this.getAuthContext(req);
    if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };

    const parsed = this.decode<RoomEndAPIReq>(req, body, RoomEndAPIReqSchema);
    if (parsed.roomId && roomId && parsed.roomId !== roomId) {
      return { status: false, msg: 'requested roomId & token roomId mismatched' };
    }

    const resolvedRoomId = roomId || parsed.roomId;
    if (!resolvedRoomId) return { status: false, msg: 'roomId required' };

    const response = await firstValueFrom(
      this.natsClient.send({ cmd: 'room.end' }, { ...parsed, roomId: resolvedRoomId }),
    );

    const wantsProto = (req.headers?.['content-type'] || '').includes('application/protobuf') || Buffer.isBuffer(req?.body);
    if (wantsProto) {
      const message = (response as any)?.$typeName ? response : create(RoomEndResSchema, response as any);
      const binary = toBinary(RoomEndResSchema, message as any);
      res.setHeader('Content-Type', 'application/protobuf');
      res.send(Buffer.from(binary));
      return;
    }

    return response;
  }

  @Post('changeVisibility')
  @HttpCode(200)
  async changeVisibility(@Body() body: ChangeVisibilityRes, @Req() req: any) {
    const { roomId, isAdmin } = this.getAuthContext(req);
    if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };

    const parsed = this.decode<ChangeVisibilityRes>(req, body, ChangeVisibilityResSchema);
    if (parsed.roomId && roomId && parsed.roomId !== roomId) {
      return { status: false, msg: 'requested roomId & token roomId mismatched' };
    }

    const resolvedRoomId = roomId || parsed.roomId;
    if (!resolvedRoomId) return { status: false, msg: 'roomId required' };

    return firstValueFrom(
      this.natsClient.send({ cmd: 'room.changeVisibility' }, { ...parsed, roomId: resolvedRoomId }),
    );
  }
}
