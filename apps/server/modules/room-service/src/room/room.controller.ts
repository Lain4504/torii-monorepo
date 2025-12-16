import { Controller, Post, UseInterceptors, Body } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomService } from './room.service';
import { BreakoutRoomService } from './breakout-room.service';
import { ProtobufInterceptor } from '@server/shared/interceptors/protobuf.interceptor';
import {
  CreateRoomReq,
  CreateRoomRes,
  RoomEndAPIReq,
  CommonResponse,
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
} from '@server/proto';

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly breakoutRoomService: BreakoutRoomService,
  ) {}

  @Post('create')
  @UseInterceptors(ProtobufInterceptor(CreateRoomReq, CreateRoomRes))
  async create(@Body() data: CreateRoomReq) {
    return this.roomService.createRoom(data as any);
  }

  @Post('end')
  @UseInterceptors(ProtobufInterceptor(RoomEndAPIReq, CommonResponse))
  end(@Body() data: RoomEndAPIReq) {
    return this.roomService.endRoom({ roomName: data.roomId });
  }

  @Post('status')
  async status(@Body() data: RoomEndAPIReq) {
    return this.roomService.getRoomStatus({ roomName: data.roomId });
  }

  @Post('list')
  async list() {
    return this.roomService.listRooms();
  }

  @MessagePattern({ cmd: 'webhook.event' })
  handleWebhook(@Payload() event: any) {
    this.roomService.handleWebhookEvent(event);
  }

  @Post('chat/systemMessage')
  @UseInterceptors(ProtobufInterceptor(DataMessageReq, CommonResponse))
  async sendSystemChatMessage(@Body() data: DataMessageReq) {
    return this.roomService.sendSystemChatMessage({
      roomId: data.roomId,
      msg: data.msg,
    });
  }

  @Post('poll/create')
  @UseInterceptors(ProtobufInterceptor(CreatePollReq, PollResponse))
  async createPoll(@Body() data: CreatePollReq) {
    return this.roomService.createPoll(data);
  }

  @Post('poll/list')
  async listPolls(@Body() data: { roomId: string }) {
    return this.roomService.listPolls(data);
  }

  @Post('poll/close')
  @UseInterceptors(ProtobufInterceptor(ClosePollReq, PollResponse))
  async closePoll(@Body() data: ClosePollReq) {
    return this.roomService.closePoll(data);
  }

  @Post('poll/submit')
  @UseInterceptors(ProtobufInterceptor(SubmitPollResponseReq, PollResponse))
  async submitPoll(@Body() data: SubmitPollResponseReq) {
    return this.roomService.submitPollResponse(data);
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
  @UseInterceptors(ProtobufInterceptor(CreateIngressReq, CreateIngressRes))
  createIngress(@Body() data: CreateIngressReq) {
    return this.roomService.createIngress(data as any);
  }

  @Post('waitingRoom/approve')
  @UseInterceptors(ProtobufInterceptor(ApproveWaitingUsersReq, CommonResponse))
  approveWaitingUsers(@Body() data: ApproveWaitingUsersReq) {
    return this.roomService.approveWaitingUsers(data as any);
  }

  @Post('waitingRoom/updateMsg')
  @UseInterceptors(
    ProtobufInterceptor(UpdateWaitingRoomMessageReq, CommonResponse),
  )
  updateWaitingRoomMessage(@Body() data: UpdateWaitingRoomMessageReq) {
    return this.roomService.updateWaitingRoomMessage(data as any);
  }

  @Post('breakoutRoom/create')
  @UseInterceptors(ProtobufInterceptor(CreateBreakoutRoomsReq, CommonResponse))
  createBreakoutRooms(@Body() data: CreateBreakoutRoomsReq) {
    return this.breakoutRoomService.createBreakoutRooms(data as any);
  }

  @Post('breakoutRoom/join')
  @UseInterceptors(ProtobufInterceptor(JoinBreakoutRoomReq, BreakoutRoomRes))
  joinBreakoutRoom(@Body() data: JoinBreakoutRoomReq) {
    return this.breakoutRoomService.joinBreakoutRoom(data as any);
  }

  @Post('breakoutRoom/end')
  @UseInterceptors(ProtobufInterceptor(EndBreakoutRoomReq, CommonResponse))
  endBreakoutRoom(@Body() data: EndBreakoutRoomReq) {
    return this.breakoutRoomService.endBreakoutRoom(data as any);
  }

  @Post('breakoutRoom/endAll')
  @UseInterceptors(ProtobufInterceptor(RoomEndAPIReq, CommonResponse))
  endAllBreakoutRooms(@Body() data: RoomEndAPIReq) {
    return this.breakoutRoomService.endAllBreakoutRooms(data as any);
  }
}
