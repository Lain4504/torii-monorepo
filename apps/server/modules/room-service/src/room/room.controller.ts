import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomService } from './room.service';
import type {
  CreateRoomReq,
  RoomEndAPIReq,
  GenerateTokenReq,
  GetActiveRoomInfoReq,
  IsRoomActiveReq,
  FetchPastRoomsReq,
} from '@workspace/protocol';

@Controller()
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
  ) { }

  @MessagePattern({ cmd: 'room.create' })
  async create(@Payload() data: CreateRoomReq) {
    return this.roomService.createRoom(data);
  }

  @MessagePattern({ cmd: 'room.end' })
  end(@Payload() data: RoomEndAPIReq) {
    return this.roomService.endRoom(data);
  }

  @MessagePattern({ cmd: 'room.isRoomActive' })
  async isRoomActive(@Payload() data: IsRoomActiveReq) {
    return this.roomService.getRoomStatus(data);
  }

  @MessagePattern({ cmd: 'room.getJoinToken' })
  async getJoinToken(@Payload() data: GenerateTokenReq) {
    return this.roomService.generateToken(data);
  }

  @MessagePattern({ cmd: 'room.getActiveRoomInfo' })
  async getActiveRoomInfo(@Payload() data: GetActiveRoomInfoReq) {
    return this.roomService.getActiveRoomInfo(data);
  }

  @MessagePattern({ cmd: 'room.getActiveRoomsInfo' })
  async getActiveRoomsInfo() {
    return this.roomService.getActiveRoomsInfo();
  }

  @MessagePattern({ cmd: 'room.fetchPastRooms' })
  async fetchPastRooms(@Payload() data: FetchPastRoomsReq) {
    return this.roomService.fetchPastRooms(data);
  }

  @MessagePattern({ cmd: 'room.changeVisibility' })
  async changeVisibility(@Payload() data: { roomId: string; visible: boolean }) {
    return this.roomService.changeVisibility(data);
  }

  @MessagePattern({ cmd: 'room.getClientFiles' })
  async getClientFiles(@Payload() data: { roomId: string }) {
    return this.roomService.getClientFiles(data);
  }

}

