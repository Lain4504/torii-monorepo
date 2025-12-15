import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomService } from './room.service';

@Controller()
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @MessagePattern({ cmd: 'room.create' })
    create(@Payload() data: { roomName: string; emptyTimeout?: number; maxParticipants?: number }) {
        return this.roomService.createRoom(data);
    }

    @MessagePattern({ cmd: 'room.end' })
    end(@Payload() data: { roomName: string }) {
        return this.roomService.endRoom(data);
    }

    @MessagePattern({ cmd: 'room.status' })
    status(@Payload() data: { roomName: string }) {
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
    startRecording(@Payload() data: { roomName: string }) {
        return this.roomService.startRecording(data);
    }

    @MessagePattern({ cmd: 'recording.stop' })
    stopRecording(@Payload() data: { roomName: string }) {
        return this.roomService.stopRecording(data);
    }

    @MessagePattern({ cmd: 'recording.fetch' })
    fetchRecordings(@Payload() data: { roomIds?: string[], from?: number, limit?: number, orderBy?: 'ASC' | 'DESC' }) {
        return this.roomService.fetchRecordings(data);
    }

    @MessagePattern({ cmd: 'recording.delete' })
    deleteRecording(@Payload() data: { recordId: string }) {
        return this.roomService.deleteRecording(data);
    }

    @MessagePattern({ cmd: 'recording.getDownloadToken' })
    getDownloadToken(@Payload() data: { recordId: string }) {
        return this.roomService.getDownloadToken(data);
    }

    @MessagePattern({ cmd: 'recording.verifyDownloadToken' })
    verifyDownloadToken(@Payload() data: { token: string }) {
        return this.roomService.verifyDownloadToken(data.token);
    }
    @MessagePattern({ cmd: 'poll.create' })
    createPoll(@Payload() data: { roomId: string; userId: string; question: string; options: any[] }) {
        return this.roomService.createPoll(data);
    }

    @MessagePattern({ cmd: 'poll.list' })
    listPolls(@Payload() data: { roomId: string }) {
        return this.roomService.listPolls(data);
    }

    @MessagePattern({ cmd: 'poll.close' })
    closePoll(@Payload() data: { roomId: string; pollId: string; userId: string }) {
        return this.roomService.closePoll(data);
    }

    @MessagePattern({ cmd: 'poll.submit' })
    submitPoll(@Payload() data: { roomId: string; pollId: string; userId: string; name: string; selectedOption: number }) {
        return this.roomService.submitPollResponse(data);
    }

    @MessagePattern({ cmd: 'poll.stats' })
    getPollStats(@Payload() data: { roomId: string; pollId: string }) {
        return this.roomService.getPollStats(data);
    }
}
