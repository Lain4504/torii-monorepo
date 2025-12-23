import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomCreateService } from './room-create.service';
import { RoomInfoService } from './room-info.service';
import type {
  CreateRoomReq,
  RoomEndAPIReq,
  GenerateTokenReq,
  GetActiveRoomInfoReq,
  IsRoomActiveReq,
  FetchPastRoomsReq,
  ChangeVisibilityRes,
} from '@workspace/protocol';

@Controller()
export class RoomController {
  constructor(
    private readonly roomCreateService: RoomCreateService,
    private readonly roomInfoService: RoomInfoService,
  ) { }

  @MessagePattern({ cmd: 'room.create' })
  async create(@Payload() data: CreateRoomReq) {
    // Use RoomCreateService for production-ready room creation
    // with lock, defaults, NATS, and DB operations
    return this.roomCreateService.createRoom(data);
  }

  @MessagePattern({ cmd: 'room.isActive' })  // Changed from room.isRoomActive to match gateway
  async isRoomActive(@Payload() data: IsRoomActiveReq) {
    // Use RoomInfoService - matches Go: RoomModel.IsRoomActive
    const { res } = await this.roomInfoService.isRoomActive(data);
    return res;
  }

  @MessagePattern({ cmd: 'room.getActiveInfo' })  // Changed from room.getActiveRoomInfo to match gateway
  async getActiveRoomInfo(@Payload() data: GetActiveRoomInfoReq) {
    // Use RoomInfoService - matches Go: RoomModel.GetActiveRoomInfo
    return this.roomInfoService.getActiveRoomInfo(data);
  }

  @MessagePattern({ cmd: 'room.getActiveRoomsInfo' })
  async getActiveRoomsInfo() {
    // Use RoomInfoService - matches Go: RoomModel.GetActiveRoomsInfo
    return this.roomInfoService.getActiveRoomsInfo();
  }

  @MessagePattern({ cmd: 'room.fetchPast' })  // Changed from room.fetchPastRooms to match gateway
  async fetchPastRooms(@Payload() data: FetchPastRoomsReq) {
    // Use RoomInfoService - matches Go: RoomModel.FetchPastRooms
    return this.roomInfoService.fetchPastRooms(data);
  }

}

