import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomService } from './room.service';

import {
    SaveFileMetadataDto,
    CreatePollDto,
    ClosePollDto,
    SubmitPollDto,
    GetPollStatsDto,
    ListPollsDto,
    CreateRoomDto,
    RoomNameDto,
    StartRecordingDto,
    StopRecordingDto,
    FetchRecordingsDto,
    DeleteRecordingDto,
    GetDownloadTokenDto,
    VerifyDownloadTokenDto,
    SendSystemChatMessageDto,
    CreateIngressDto,
    ApproveWaitingUsersDto,
    UpdateWaitingRoomMessageDto
} from './room.dto';


@Controller()
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @MessagePattern({ cmd: 'room.create' })
    create(@Payload() data: CreateRoomDto) {
        return this.roomService.createRoom(data);
    }

    @MessagePattern({ cmd: 'room.end' })
    end(@Payload() data: RoomNameDto) {
        return this.roomService.endRoom(data);
    }

    @MessagePattern({ cmd: 'room.status' })
    status(@Payload() data: RoomNameDto) {
        return this.roomService.getRoomStatus(data);
    }

    @MessagePattern({ cmd: 'room.list' })
    list() {
        return this.roomService.listRooms();
    }

    @MessagePattern({ cmd: 'webhook.event' })
    handleWebhook(@Payload() event: any) {
        this.roomService.handleWebhookEvent(event);
    }

    @MessagePattern({ cmd: 'recording.start' })
    startRecording(@Payload() data: StartRecordingDto) {
        return this.roomService.startRecording(data);
    }

    @MessagePattern({ cmd: 'recording.stop' })
    stopRecording(@Payload() data: StopRecordingDto) {
        return this.roomService.stopRecording(data);
    }

    @MessagePattern({ cmd: 'recording.fetch' })
    fetchRecordings(@Payload() data: FetchRecordingsDto) {
        return this.roomService.fetchRecordings(data);
    }

    @MessagePattern({ cmd: 'recording.delete' })
    deleteRecording(@Payload() data: DeleteRecordingDto) {
        return this.roomService.deleteRecording(data);
    }

    @MessagePattern({ cmd: 'recording.getDownloadToken' })
    getDownloadToken(@Payload() data: GetDownloadTokenDto) {
        return this.roomService.getDownloadToken(data);
    }

    @MessagePattern({ cmd: 'recording.verifyDownloadToken' })
    verifyDownloadToken(@Payload() data: VerifyDownloadTokenDto) {
        return this.roomService.verifyDownloadToken(data.token);
    }

    @MessagePattern({ cmd: 'chat.systemMessage' })
    sendSystemChatMessage(@Payload() data: SendSystemChatMessageDto) {
        return this.roomService.sendSystemChatMessage(data);
    }

    @MessagePattern({ cmd: 'poll.create' })
    createPoll(@Payload() data: CreatePollDto) {
        return this.roomService.createPoll(data);
    }

    @MessagePattern({ cmd: 'poll.list' })
    listPolls(@Payload() data: { roomId: string }) {
        return this.roomService.listPolls(data);
    }

    @MessagePattern({ cmd: 'poll.close' })
    closePoll(@Payload() data: ClosePollDto) {
        return this.roomService.closePoll(data);
    }

    @MessagePattern({ cmd: 'poll.submit' })
    submitPoll(@Payload() data: SubmitPollDto) {
        return this.roomService.submitPollResponse(data);
    }

    @MessagePattern({ cmd: 'poll.stats' })
    getPollStats(@Payload() data: GetPollStatsDto) {
        return this.roomService.getPollStats(data);
    }

    @MessagePattern({ cmd: 'file.saveMetadata' })
    saveFileMetadata(@Payload() data: SaveFileMetadataDto) {
        return this.roomService.saveFileMetadata(data);
    }

    @MessagePattern({ cmd: 'ingress.create' })
    createIngress(@Payload() data: CreateIngressDto) {
        return this.roomService.createIngress(data);
    }

    @MessagePattern({ cmd: 'waitingRoom.approveUsers' })
    approveWaitingUsers(@Payload() data: ApproveWaitingUsersDto) {
        return this.roomService.approveWaitingUsers(data);
    }

    @MessagePattern({ cmd: 'waitingRoom.updateMsg' })
    updateWaitingRoomMessage(@Payload() data: UpdateWaitingRoomMessageDto) {
        return this.roomService.updateWaitingRoomMessage(data);
    }
}
