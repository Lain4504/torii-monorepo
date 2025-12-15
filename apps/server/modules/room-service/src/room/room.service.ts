import { Injectable, Logger } from '@nestjs/common';
import { PrismaService, LiveKitService, RedisService } from '@server/shared';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoomService {
    private readonly logger = new Logger(RoomService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly liveKitService: LiveKitService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
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

    async startRecording(data: { roomName: string }) {
        try {
            this.logger.log(`Starting recording for room: ${data.roomName}`);
            // Check if room is running
            const roomInfo = await this.prisma.roomInfo.findFirst({
                where: { roomId: data.roomName, isRunning: true },
            });

            if (!roomInfo) {
                throw new Error('Room is not running');
            }

            const recording = await this.liveKitService.getRoomClient().startRoomCompositeEgress(data.roomName, {
                file: {
                    filepath: `recordings/${data.roomName}-${Date.now()}.mp4`,
                },
            });

            await this.prisma.roomInfo.update({
                where: { id: roomInfo.id },
                data: { isRecording: true, recorderId: recording.egressId },
            });

            return { success: true, recordingId: recording.egressId };
        } catch (error) {
            this.logger.error(`Error starting recording: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async stopRecording(data: { roomName: string }) {
        try {
            this.logger.log(`Stopping recording for room: ${data.roomName}`);
            const roomInfo = await this.prisma.roomInfo.findFirst({
                where: { roomId: data.roomName, isRunning: true },
            });

            if (!roomInfo || !roomInfo.recorderId) {
                throw new Error('No active recording found for this room');
            }

            await this.liveKitService.getRoomClient().stopEgress(roomInfo.recorderId);

            await this.prisma.roomInfo.update({
                where: { id: roomInfo.id },
                data: { isRecording: false, recorderId: '' },
            });

            return { success: true, message: 'Recording stopped' };
        } catch (error) {
            this.logger.error(`Error stopping recording: ${error.message}`);
            throw new RpcException(error.message);
        }
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

                case 'egress_ended': // Recording finished
                    if (event.egress && event.egress.file) {
                        const recordingInfo = event.egress;
                        await this.prisma.recording.create({
                            data: {
                                recordId: recordingInfo.egressId,
                                roomSid: recordingInfo.roomSid,
                                roomId: roomId,
                                recorderId: recordingInfo.egressId,
                                filePath: recordingInfo.file.location,
                                size: Number(recordingInfo.file.size),
                                roomCreationTime: 0,
                                creationTime: Number(recordingInfo.startedAt) || 0,
                            }
                        });
                    }
                    break;
            }
        } catch (error) {
            this.logger.error(`Error handling webhook event ${eventType}: ${error.message}`);
        }
    }

    async fetchRecordings(data: { roomIds?: string[], from?: number, limit?: number, orderBy?: 'ASC' | 'DESC' }) {
        const { roomIds, from = 0, limit = 20, orderBy = 'DESC' } = data;
        const where = roomIds && roomIds.length > 0 ? { roomId: { in: roomIds } } : {};

        try {
            const [total, recordings] = await Promise.all([
                this.prisma.recording.count({ where }),
                this.prisma.recording.findMany({
                    where,
                    skip: from,
                    take: limit,
                    orderBy: { creationTime: orderBy.toLowerCase() as 'asc' | 'desc' },
                }),
            ]);

            return {
                totalRecordings: total,
                from,
                limit,
                orderBy,
                recordingsList: recordings,
            };
        } catch (error) {
            this.logger.error(`Error fetching recordings: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async deleteRecording(data: { recordId: string }) {
        try {
            const recording = await this.prisma.recording.findUnique({
                where: { recordId: data.recordId },
            });

            if (!recording) {
                throw new Error('Recording not found');
            }

            // Delete from DB
            await this.prisma.recording.delete({
                where: { id: recording.id },
            });

            // Try to delete file if it exists locally
            // Note: This logic assumes shared storage or local path.
            // If using S3, we would need to call S3 delete API.
            if (fs.existsSync(recording.filePath)) {
                try {
                    fs.unlinkSync(recording.filePath);
                } catch (e) {
                    this.logger.warn(`Failed to delete file ${recording.filePath}: ${e.message}`);
                }
            }

            return { success: true, message: 'Recording deleted' };
        } catch (error) {
            this.logger.error(`Error deleting recording: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async getDownloadToken(data: { recordId: string }) {
        try {
            const recording = await this.prisma.recording.findUnique({
                where: { recordId: data.recordId },
            });

            if (!recording) {
                throw new Error('Recording not found');
            }

            const secret = this.configService.get('LIVEKIT_API_SECRET');
            if (!secret) {
                throw new Error('Server misconfiguration: LIVEKIT_API_SECRET missing');
            }

            const token = jwt.sign({
                iss: this.configService.get('LIVEKIT_API_KEY'),
                sub: recording.filePath,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour validity
            }, secret, { algorithm: 'HS256' });

            return { success: true, token };
        } catch (error) {
            this.logger.error(`Error generating download token: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async verifyDownloadToken(token: string) {
        try {
            const secret = this.configService.get('LIVEKIT_API_SECRET');
            const decoded = jwt.verify(token, secret) as any;

            if (!decoded || !decoded.sub) {
                throw new Error('Invalid token');
            }

            return { isValid: true, filePath: decoded.sub };
            return { isValid: true, filePath: decoded.sub };
        } catch (error) {
            this.logger.error(`Error verifying token: ${error.message}`);
            throw new RpcException('Invalid or expired token');
        }
    }

    // --- Polls Module (Redis) ---

    async createPoll(data: { roomId: string; userId: string; question: string; options: any[] }) {
        try {
            const pollId = uuidv4();
            const pollInfo = {
                id: pollId,
                roomId: data.roomId,
                question: data.question,
                options: data.options,
                isRunning: true,
                createdBy: data.userId,
                created: Math.floor(Date.now() / 1000),
            };

            // Store in Redis: rooms:<roomId>:polls -> field: pollId -> value: JSON
            await this.redisService.hset(
                `rooms:${data.roomId}:polls`,
                pollId,
                JSON.stringify(pollInfo)
            );

            return { success: true, pollId, message: 'Poll created' };
        } catch (error) {
            this.logger.error(`Error creating poll: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async listPolls(data: { roomId: string }) {
        try {
            const pollsMap = await this.redisService.hgetall(`rooms:${data.roomId}:polls`);
            const polls = Object.values(pollsMap).map(p => JSON.parse(p));
            // Sort by created desc
            polls.sort((a, b) => b.created - a.created);
            return { success: true, polls };
        } catch (error) {
            this.logger.error(`Error listing polls: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async closePoll(data: { roomId: string; pollId: string; userId: string }) {
        try {
            const key = `rooms:${data.roomId}:polls`;
            const pollJson = await this.redisService.hget(key, data.pollId);

            if (!pollJson) {
                throw new Error('Poll not found');
            }

            const poll = JSON.parse(pollJson);
            poll.isRunning = false;

            await this.redisService.hset(key, data.pollId, JSON.stringify(poll));

            return { success: true, message: 'Poll closed' };
        } catch (error) {
            this.logger.error(`Error closing poll: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async submitPollResponse(data: { roomId: string; pollId: string; userId: string; name: string; selectedOption: number }) {
        try {
            // Check if poll exists and is running
            const pollJson = await this.redisService.hget(`rooms:${data.roomId}:polls`, data.pollId);
            if (!pollJson) {
                throw new Error('Poll not found');
            }
            const poll = JSON.parse(pollJson);
            if (!poll.isRunning) {
                throw new Error('Poll is closed');
            }

            // Store response: polls:<pollId>:responses -> field: userId -> value: JSON
            const response = {
                userId: data.userId,
                name: data.name,
                vote: data.selectedOption,
            };

            await this.redisService.hset(
                `polls:${data.pollId}:responses`,
                data.userId,
                JSON.stringify(response)
            );

            return { success: true, message: 'Vote submitted' };
        } catch (error) {
            this.logger.error(`Error submitting vote: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async getPollStats(data: { roomId: string; pollId: string }) {
        try {
            const responsesMap = await this.redisService.hgetall(`polls:${data.pollId}:responses`);
            const responses = Object.values(responsesMap).map(r => JSON.parse(r));

            // Aggregation logic could be here if needed, 
            // but usually we just return the raw responses or a simple count map.
            // Let's return raw for now as client might calculate.

            return { success: true, responses };
        } catch (error) {
            this.logger.error(`Error getting poll stats: ${error.message}`);
            throw new RpcException(error.message);
        }
    }
}
