import { Controller, Post, UseInterceptors, Body } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomService } from './room.service';
import { BreakoutRoomService } from './breakout-room.service';
import {
  CommonResponse,
    // Schemas for interceptor
    DataMessageReqSchema,
    CommonResponseSchema,
    CreatePollReqSchema,
    PollResponseSchema,
    ClosePollReqSchema,
    SubmitPollResponseReqSchema,
    CreateIngressReqSchema,
    CreateIngressResSchema,
    ApproveWaitingUsersReqSchema,
    UpdateWaitingRoomMessageReqSchema,
    CreateBreakoutRoomsReqSchema,
    JoinBreakoutRoomReqSchema,
    BreakoutRoomResSchema,
    EndBreakoutRoomReqSchema,
    RoomEndAPIReqSchema,
} from '@workspace/protocol';
import type {
  CreateRoomReq,
  RoomEndAPIReq,
  CreateBreakoutRoomsReq,
  JoinBreakoutRoomReq,
  EndBreakoutRoomReq,
  CreateIngressReq,
  ApproveWaitingUsersReq,
  UpdateWaitingRoomMessageReq,
  CreatePollReq,
  SubmitPollResponseReq,
  ClosePollReq,
  DataMessageReq,
} from '@workspace/protocol';
import {ProtobufInterceptor} from "@server/shared";

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly breakoutRoomService: BreakoutRoomService,
  ) { }

  // ============================================
  // NATS Message Patterns (Called via Gateway)
  // ============================================

  @MessagePattern({ cmd: 'room.create' })
  async create(@Payload() data: CreateRoomReq) {
    return this.roomService.createRoom(data as any);
  }

  @MessagePattern({ cmd: 'room.end' })
  end(@Payload() data: RoomEndAPIReq) {
    return this.roomService.endRoom({ roomId: data.roomId });
  }

  @MessagePattern({ cmd: 'room.status' })
  async status(@Payload() data: RoomEndAPIReq) {
    return this.roomService.getRoomStatus({ roomId: data.roomId });
  }

  @MessagePattern({ cmd: 'room.isRoomActive' })
  async isRoomActive(@Payload() data: any) {
    const status = await this.roomService.getRoomStatus(data);
    return {
      status: true,
      is_active: status.isRunning,
      msg: status.isRunning ? 'active' : 'not active',
    };
  }

  @MessagePattern({ cmd: 'room.getJoinToken' })
  async getJoinToken(@Payload() data: any) {
    return this.roomService.getJoinToken(data);
  }

  @MessagePattern({ cmd: 'room.list' })
  async list() {
    return this.roomService.listRooms();
  }

  @MessagePattern({ cmd: 'room.getActiveRoomInfo' })
  async getActiveRoomInfo(@Payload() data: any) {
    return this.roomService.getActiveRoomInfo(data);
  }

  @MessagePattern({ cmd: 'room.getActiveRoomsInfo' })
  async getActiveRoomsInfo() {
    return this.roomService.getActiveRoomsInfo();
  }

  @MessagePattern({ cmd: 'room.fetchPastRooms' })
  async fetchPastRooms(@Payload() data: any) {
    return this.roomService.fetchPastRooms(data);
  }

  @MessagePattern({ cmd: 'room.changeVisibility' })
  async changeVisibility(@Payload() data: any) {
    return this.roomService.changeVisibility(data);
  }

  @MessagePattern({ cmd: 'user.updateLockSettings' })
  async updateLockSettings(@Payload() data: any) {
    return this.roomService.updateUserLockSettings(data);
  }

  @MessagePattern({ cmd: 'user.muteUnmuteTrack' })
  async muteUnmuteTrack(@Payload() data: any) {
    return this.roomService.muteUnmuteTrack(data);
  }

  @MessagePattern({ cmd: 'user.removeParticipant' })
  async removeParticipant(@Payload() data: any) {
    return this.roomService.removeParticipant(data);
  }

  @MessagePattern({ cmd: 'user.switchPresenter' })
  async switchPresenter(@Payload() data: any) {
    return this.roomService.switchPresenter(data);
  }

  @MessagePattern({ cmd: 'poll.activate' })
  async activatePolls(@Payload() data: any) {
    return this.roomService.activatePolls(data);
  }

  @MessagePattern({ cmd: 'poll.list' })
  async listPollsMsg(@Payload() data: any) {
    return this.roomService.listPolls(data);
  }

  @MessagePattern({ cmd: 'poll.stats' })
  async getPollStatsMsg(@Payload() data: any) {
    return this.roomService.getPollStats(data);
  }

  @MessagePattern({ cmd: 'poll.countResponses' })
  async countPollTotalResponses(@Payload() data: any) {
    return this.roomService.countPollTotalResponses(data);
  }

  @MessagePattern({ cmd: 'poll.userOption' })
  async userSelectedOption(@Payload() data: any) {
    return this.roomService.userSelectedOption(data);
  }

  @MessagePattern({ cmd: 'poll.responsesDetails' })
  async getPollResponsesDetails(@Payload() data: any) {
    return this.roomService.getPollResponsesDetails(data);
  }

  @MessagePattern({ cmd: 'poll.responsesResult' })
  async getResponsesResult(@Payload() data: any) {
    return this.roomService.getResponsesResult(data);
  }

  @MessagePattern({ cmd: 'recording.api' })
  async handleRecordingApi(@Payload() data: any) {
    return this.roomService.handleRecordingApi(data);
  }

  @MessagePattern({ cmd: 'recording.info' })
  async getRecordingInfo(@Payload() data: any) {
    return this.roomService.getRecordingInfo(data);
  }

  @MessagePattern({ cmd: 'recording.updateMetadata' })
  async updateRecordingMetadata(@Payload() data: any) {
    return this.roomService.updateRecordingMetadata(data);
  }

  @MessagePattern({ cmd: 'recorder.rtmp' })
  async handleRtmpApi(@Payload() data: any) {
    return this.roomService.handleRtmpApi(data);
  }

  @MessagePattern({ cmd: 'recorder.events' })
  async handleRecorderEvents(@Payload() data: any) {
    return this.roomService.handleRecorderEvents(data);
  }

  @MessagePattern({ cmd: 'file.convertWhiteboardFile' })
  async convertWhiteboardFile(@Payload() data: any) {
    return this.roomService.convertWhiteboardFile(data);
  }

  @MessagePattern({ cmd: 'exMedia.handle' })
  async handleExMedia(@Payload() data: any) {
    return this.roomService.handleExMedia(data);
  }

  @MessagePattern({ cmd: 'exDisplay.handle' })
  async handleExDisplay(@Payload() data: any) {
    return this.roomService.handleExDisplay(data);
  }

  @MessagePattern({ cmd: 'ingress.create' })
  async createIngressMsg(@Payload() data: any) {
    return this.roomService.createIngress(data);
  }

  @MessagePattern({ cmd: 'waitingRoom.approve' })
  async approveWaitingUsersMsg(@Payload() data: any) {
    return this.roomService.approveWaitingUsers(data);
  }

  @MessagePattern({ cmd: 'waitingRoom.updateMsg' })
  async updateWaitingRoomMsg(@Payload() data: any) {
    return this.roomService.updateWaitingRoomMessage(data);
  }

  @MessagePattern({ cmd: 'breakout.create' })
  async createBreakoutRoomsMsg(@Payload() data: any) {
    return this.breakoutRoomService.createBreakoutRooms(data);
  }

  @MessagePattern({ cmd: 'breakout.join' })
  async joinBreakoutRoomMsg(@Payload() data: any) {
    return this.breakoutRoomService.joinBreakoutRoom(data);
  }

  @MessagePattern({ cmd: 'breakout.list' })
  async listBreakoutRooms(@Payload() data: any) {
    return this.breakoutRoomService.getBreakoutRooms(data);
  }

  @MessagePattern({ cmd: 'breakout.myRooms' })
  async getMyBreakoutRooms(@Payload() data: any) {
    return this.breakoutRoomService.getMyBreakoutRooms(data);
  }

  @MessagePattern({ cmd: 'breakout.increaseDuration' })
  async increaseBreakoutRoomDuration(@Payload() data: any) {
    return this.breakoutRoomService.increaseBreakoutRoomDuration(data);
  }

  @MessagePattern({ cmd: 'breakout.sendMsg' })
  async sendBreakoutRoomMsg(@Payload() data: any) {
    return this.breakoutRoomService.sendBreakoutRoomMsg(data);
  }

  @MessagePattern({ cmd: 'breakout.endRoom' })
  async endBreakoutRoomMsg(@Payload() data: any) {
    return this.breakoutRoomService.endBreakoutRoom(data);
  }

  @MessagePattern({ cmd: 'breakout.endAllRooms' })
  async endAllBreakoutRoomsMsg(@Payload() data: any) {
    return this.breakoutRoomService.endAllBreakoutRooms(data);
  }

  @MessagePattern({ cmd: 'file.getClientFiles' })
  async getClientFiles(@Payload() data: any) {
    return this.roomService.getClientFiles(data);
  }

  @MessagePattern({ cmd: 'room.getRoomFilesByType' })
  async getRoomFilesByType(@Payload() data: any) {
    return this.roomService.getRoomFilesByType(data);
  }

  @MessagePattern({ cmd: 'webhook.event' })
  handleWebhook(@Payload() event: any) {
    this.roomService.handleWebhookEvent(event);
  }

  @MessagePattern({ cmd: 'room.chat.systemMessage' })
  async sendSystemChatMessage(@Payload() data: DataMessageReq) {
    return this.roomService.sendSystemChatMessage({
      roomId: data.roomId,
      msg: data.msg,
    });
  }

  // ============================================
  // Polls
  // ============================================

  @MessagePattern({ cmd: 'poll.create' })
  async createPoll(@Body() data: CreatePollReq) {
    return this.roomService.createPoll(data);
  }

  @MessagePattern({ cmd: 'poll.list' })
  async listPolls(@Payload() data: { roomId: string }) {
    return this.roomService.listPolls(data);
  }

  @MessagePattern({ cmd: 'poll.close' })
  async closePoll(@Payload() data: ClosePollReq) {
    return this.roomService.closePoll(data);
  }

  @MessagePattern({ cmd: 'poll.submit' })
  async submitPoll(@Payload() data: SubmitPollResponseReq) {
    return this.roomService.submitPollResponse({
      ...data,
      selectedOption: Number(data.selectedOption),
    });
  }

  @MessagePattern({ cmd: 'poll.stats' })
  async getPollStats(@Payload() data: { roomId: string; pollId: string }) {
    return this.roomService.getPollStats(data);
  }

  // ============================================
  // Files
  // ============================================

  @MessagePattern({ cmd: 'room.file.saveMetadata' })
  async saveFileMetadata(@Payload() data: any) {
    return this.roomService.saveFileMetadata(data);
  }

  // ============================================
  // Ingress
  // ============================================

  @MessagePattern({ cmd: 'room.ingress.create' })
  createIngress(@Payload() data: CreateIngressReq) {
    return this.roomService.createIngress(data as any);
  }

  // ============================================
  // Waiting Room
  // ============================================

  @MessagePattern({ cmd: 'room.waitingRoom.approve' })
  approveWaitingUsers(@Payload() data: ApproveWaitingUsersReq) {
    return this.roomService.approveWaitingUsers(data as any);
  }

  @MessagePattern({ cmd: 'room.waitingRoom.updateMsg' })
  updateWaitingRoomMessage(@Payload() data: UpdateWaitingRoomMessageReq) {
    return this.roomService.updateWaitingRoomMessage(data as any);
  }

  // ============================================
  // Breakout Rooms
  // ============================================

  @MessagePattern({ cmd: 'breakoutRoom.create' })
  createBreakoutRooms(@Payload() data: CreateBreakoutRoomsReq) {
    return this.breakoutRoomService.createBreakoutRooms(data as any);
  }

  @MessagePattern({ cmd: 'breakoutRoom.join' })
  joinBreakoutRoom(@Payload() data: JoinBreakoutRoomReq) {
    return this.breakoutRoomService.joinBreakoutRoom(data as any);
  }

  @MessagePattern({ cmd: 'breakoutRoom.end' })
  endBreakoutRoom(@Payload() data: EndBreakoutRoomReq) {
    return this.breakoutRoomService.endBreakoutRoom(data as any);
  }

  @MessagePattern({ cmd: 'breakoutRoom.endAll' })
  endAllBreakoutRooms(@Payload() data: RoomEndAPIReq) {
    return this.breakoutRoomService.endAllBreakoutRooms(data as any);
  }
}

