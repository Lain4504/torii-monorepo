import { Controller, Injectable, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomCreateService } from './room-create.service';
import { RoomInfoService } from './room-info.service';
import { RoomModifyService } from './room-modify.service';
import { RoomEndService } from './room-end.service';
import type {
  CreateRoomReq,
  RoomEndAPIReq,
  GenerateTokenReq,
  GetActiveRoomInfoReq,
  IsRoomActiveReq,
  FetchPastRoomsReq,
  ChangeVisibilityRes,
} from '@workspace/protocol';


/**
 * RoomController - Microservice Controller
 * 
 * CRITICAL: Do NOT use @Controller() decorator for microservice controllers!
 * BUT you MUST use @Injectable() for dependency injection to work!
 * 
 * Why? In NestJS:
 * - @Controller() is for HTTP routes (@Get, @Post, etc.)
 * - Microservices use ONLY @MessagePattern (no @Controller needed)
 * - But still need @Injectable() for DI
 * - Using both will cause @MessagePattern to be IGNORED
 * 
 * This controller handles NATS message patterns, not HTTP routes.
 */
@Controller()
export class RoomController {
  private readonly logger = new Logger(RoomController.name);

  constructor(
    private readonly roomCreateService: RoomCreateService,
    private readonly roomInfoService: RoomInfoService,
    private readonly roomModifyService: RoomModifyService,
    private readonly roomEndService: RoomEndService,
  ) { }

  @MessagePattern({ cmd: 'room.create' })
  async create(@Payload() data: CreateRoomReq) {
    // Use RoomCreateService for production-ready room creation
    // with lock, defaults, NATS, and DB operations
    return this.roomCreateService.createRoom(data);
  }

  @MessagePattern({ cmd: 'room.isActive' })
  async isRoomActive(@Payload() data: IsRoomActiveReq) {
    // NestJS NATS transport automatically deserializes to plain objects
    // No need for fromBinary() - data is already a deserialized object
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

  @MessagePattern({ cmd: 'room.end' })
  async endRoom(@Payload() data: any) {
    // Implemented from Go: plugNmeet-server/pkg/models/room_end.go
    return this.roomEndService.endRoom(data);
  }

  @MessagePattern({ cmd: 'room.changeVisibility' })
  async changeVisibility(@Payload() data: any) {
    // Implemented from Go: plugNmeet-server/pkg/models/room_modify.go
    return this.roomModifyService.changeVisibility(data);
  }

  @MessagePattern({ cmd: 'room.getRoomInfoByRoomId' })
  async getRoomInfoByRoomId(@Payload() data: { roomId: string; isRunning: boolean }) {
    // Called from Gateway: auth-room.controller.ts line 107
    // Get room info from database
    return this.roomInfoService.getRoomInfoByRoomId(data.roomId, data.isRunning);
  }

  @MessagePattern({ cmd: 'room.getRoomInfoBySid' })
  async getRoomInfoBySid(@Payload() data: { sid: string; isRunning: number }) {
    // Called from Gateway: auth-room.controller.ts lines 193, 264, 341
    // Get room info by SID (LiveKit room SID)
    // For now, treating sid as roomId - may need adjustment
    const isRunning = data.isRunning === 1;
    return this.roomInfoService.getRoomInfoByRoomId(data.sid, isRunning);
  }

}

