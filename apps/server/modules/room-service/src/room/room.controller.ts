import { Controller, Post, UseInterceptors, Body } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomService } from './room.service';
import { BreakoutRoomService } from './breakout-room.service';
import { ProtobufInterceptor } from '@server/shared/interceptors/protobuf.interceptor';
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
  CreateRoomRes,
  RoomEndAPIReq,
  CreateBreakoutRoomsReq,
  JoinBreakoutRoomReq,
  BreakoutRoomRes,
  EndBreakoutRoomReq,
  CreateIngressReq,
  CreateIngressRes,
  ApproveWaitingUsersReq,
  UpdateWaitingRoomMessageReq,
  CreatePollReq,
  SubmitPollResponseReq,
  ClosePollReq,
  PollResponse,
  DataMessageReq,
} from '@workspace/protocol';

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly breakoutRoomService: BreakoutRoomService,
  ) { }

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

  @Post('chat/systemMessage')
  @UseInterceptors(ProtobufInterceptor(DataMessageReqSchema, CommonResponseSchema))
  async sendSystemChatMessage(@Body() data: DataMessageReq) {
    return this.roomService.sendSystemChatMessage({
      roomId: data.roomId,
      msg: data.msg,
    });
  }

  @Post('poll/create')
  @UseInterceptors(ProtobufInterceptor(CreatePollReqSchema, PollResponseSchema))
  async createPoll(@Body() data: CreatePollReq) {
    return this.roomService.createPoll(data);
  }

  @Post('poll/list')
  async listPolls(@Body() data: { roomId: string }) {
    return this.roomService.listPolls(data);
  }

  @Post('poll/close')
  @UseInterceptors(ProtobufInterceptor(ClosePollReqSchema, PollResponseSchema))
  async closePoll(@Body() data: ClosePollReq) {
    return this.roomService.closePoll(data);
  }

  @Post('poll/submit')
  @UseInterceptors(ProtobufInterceptor(SubmitPollResponseReqSchema, PollResponseSchema))
  async submitPoll(@Body() data: SubmitPollResponseReq) {
    return this.roomService.submitPollResponse({
      ...data,
      selectedOption: Number(data.selectedOption),
    });
  }

  @Post('poll/stats')
  async getPollStats(@Body() data: { roomId: string; pollId: string }) {
    return this.roomService.getPollStats(data);
  }

  @Post('file/saveMetadata')
  async saveFileMetadata(@Body() data: any) {
    return this.roomService.saveFileMetadata(data);
  }

  @Post('ingress/create')
  @UseInterceptors(ProtobufInterceptor(CreateIngressReqSchema, CreateIngressResSchema))
  createIngress(@Body() data: CreateIngressReq) {
    return this.roomService.createIngress(data as any);
  }

  @Post('waitingRoom/approve')
  @UseInterceptors(ProtobufInterceptor(ApproveWaitingUsersReqSchema, CommonResponseSchema))
  approveWaitingUsers(@Body() data: ApproveWaitingUsersReq) {
    return this.roomService.approveWaitingUsers(data as any);
  }

  @Post('waitingRoom/updateMsg')
  @UseInterceptors(
    ProtobufInterceptor(UpdateWaitingRoomMessageReqSchema, CommonResponseSchema),
  )
  updateWaitingRoomMessage(@Body() data: UpdateWaitingRoomMessageReq) {
    return this.roomService.updateWaitingRoomMessage(data as any);
  }

  @Post('breakoutRoom/create')
  @UseInterceptors(ProtobufInterceptor(CreateBreakoutRoomsReqSchema, CommonResponseSchema))
  createBreakoutRooms(@Body() data: CreateBreakoutRoomsReq) {
    return this.breakoutRoomService.createBreakoutRooms(data as any);
  }

  @Post('breakoutRoom/join')
  @UseInterceptors(ProtobufInterceptor(JoinBreakoutRoomReqSchema, BreakoutRoomResSchema))
  joinBreakoutRoom(@Body() data: JoinBreakoutRoomReq) {
    return this.breakoutRoomService.joinBreakoutRoom(data as any);
  }

  @Post('breakoutRoom/end')
  @UseInterceptors(ProtobufInterceptor(EndBreakoutRoomReqSchema, CommonResponseSchema))
  endBreakoutRoom(@Body() data: EndBreakoutRoomReq) {
    return this.breakoutRoomService.endBreakoutRoom(data as any);
  }

  @Post('breakoutRoom/endAll')
  @UseInterceptors(ProtobufInterceptor(RoomEndAPIReqSchema, CommonResponseSchema))
  endAllBreakoutRooms(@Body() data: RoomEndAPIReq) {
    return this.breakoutRoomService.endAllBreakoutRooms(data as any);
  }
}

