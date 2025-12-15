import { Injectable, Logger } from '@nestjs/common';
import { PrismaService, LiveKitService } from '@server/shared';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RoomService {
    private readonly logger = new Logger(RoomService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly liveKitService: LiveKitService,
    ) { }

    async createRoom(data: { roomName: string; emptyTimeout?: number; maxParticipants?: number }) {
        try {
            this.logger.log(`Creating room: ${data.roomName}`);

            // Check if room exists in DB
            const existingRoom = await this.prisma.roomInfo.findFirst({
                where: { roomId: data.roomName, isRunning: true },
            });

            if (existingRoom) {
                return { success: true, room: existingRoom, message: 'Room already active' };
            }

            // Create in LiveKit
            const room = await this.liveKitService.getRoomClient().createRoom({
                name: data.roomName,
                emptyTimeout: data.emptyTimeout || 60 * 60, // 1 hour default
                maxParticipants: data.maxParticipants || 100,
            });

            // Save to DB
            const dbRoom = await this.prisma.roomInfo.create({
                data: {
                    roomId: room.name,
                    sid: room.sid,
                    roomTitle: data.roomName,
                    isRunning: true,
                    creationTime: Number(room.creationTime),
                },
            });

            return { success: true, room: dbRoom };
        } catch (error) {
            this.logger.error(`Error creating room: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async endRoom(data: { roomName: string }) {
        try {
            this.logger.log(`Ending room: ${data.roomName}`);
            await this.liveKitService.getRoomClient().deleteRoom(data.roomName);

            await this.prisma.roomInfo.updateMany({
                where: { roomId: data.roomName, isRunning: true },
                data: { isRunning: false, endedAt: new Date() },
            });

            return { success: true, message: 'Room ended' };
        } catch (error) {
            this.logger.error(`Error ending room: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async getRoomStatus(data: { roomName: string }) {
        const room = await this.prisma.roomInfo.findFirst({
            where: { roomId: data.roomName, isRunning: true },
        });
        return { isRunning: !!room, room };
    }

    async listRooms() {
        return this.prisma.roomInfo.findMany({
            where: { isRunning: true }
        });
    }

    async handleWebhookEvent(event: any) {
        if (!event || !event.room) return;
        const roomId = event.room.name;
        const eventType = event.event;

        try {
            switch (eventType) {
                case 'room_started':
                    await this.prisma.roomInfo.upsert({
                        where: { sid: event.room.sid },
                        update: { isRunning: true },
                        create: {
                            roomId: roomId,
                            sid: event.room.sid,
                            roomTitle: roomId,
                            isRunning: true,
                            creationTime: Number(event.room.creationTime),
                        },
                    });
                    break;

                case 'room_finished':
                    await this.prisma.roomInfo.updateMany({
                        where: { sid: event.room.sid },
                        data: { isRunning: false, endedAt: new Date() },
                    });
                    break;

                case 'participant_joined':
                    await this.prisma.roomInfo.updateMany({
                        where: { sid: event.room.sid },
                        data: { joinedParticipants: { increment: 1 } },
                    });
                    break;

                case 'participant_left':
                    await this.prisma.roomInfo.updateMany({
                        where: { sid: event.room.sid },
                        data: { joinedParticipants: { decrement: 1 } },
                    });
                    break;
            }
        } catch (error) {
            this.logger.error(`Error handling webhook event ${eventType}: ${error.message}`);
        }
    }
}
