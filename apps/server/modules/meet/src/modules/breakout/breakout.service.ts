import { Injectable, Logger } from '@nestjs/common';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import {
    CreateBreakoutRoomsReq,
    BreakoutRoom,
    CreateRoomReq,
    NatsMsgServerToClientEvents,
    BreakoutRoomUser,
    RoomMetadata,
    RoomMetadataSchema,
    BreakoutRoomSchema,
    JoinBreakoutRoomReq,
    GenerateTokenReq,
    UserInfo,
    EndBreakoutRoomReq,
    RoomEndReq,
    BroadcastBreakoutRoomMsgReq,
    IncreaseBreakoutRoomDurationReq,
} from '@workspace/protocol';
import { RoomCreateService } from '../room/room-create.service';
import { RoomEndService } from '../room/room-end.service';
import { create, toJsonString, fromJson, fromJsonString } from '@bufbuild/protobuf';
import { v4 as uuidv4 } from 'uuid';
import { RoomDurationService } from '../room/room-duration.service';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsUserService, USER_STATUS_ONLINE } from '../../interfaces/nats/nats-user.service';
import { RoomService } from '../room/room.service';
import { ConfigService } from '@nestjs/config';

const BREAKOUT_ROOM_FORMAT = '%s-%s';

@Injectable()
export class BreakoutService {
    private readonly logger = new Logger(BreakoutService.name);
    private readonly waitBeforePostStart = 2000; // 2 seconds

    constructor(
        private readonly natsRoomService: NatsRoomService,
        private readonly natsSystemEvents: NatsSystemEventsService,
        private readonly roomCreateService: RoomCreateService,
        private readonly roomEndService: RoomEndService,
        private readonly roomDurationService: RoomDurationService,
        private readonly natsService: NatsService,
        private readonly natsUserService: NatsUserService,
        private readonly roomService: RoomService,
    ) { }

    /**
     * CreateBreakoutRooms creates multiple breakout rooms under a parent room
     */
    async createBreakoutRooms(req: CreateBreakoutRoomsReq): Promise<void> {
        this.logger.log(`Creating breakout rooms for parent room: ${req.roomId}, count: ${req.rooms.length}`);

        // 1. Get Parent Room Info & Metadata
        const { info: mainRoom, metadata: meta } = await this.natsRoomService.getRoomInfoWithMetadata(req.roomId);

        if (!mainRoom || !meta) {
            throw new Error('Invalid parent room information');
        }

        // 2. Duration Check
        if (meta.roomFeatures?.roomDuration && meta.roomFeatures.roomDuration > 0) {
            const isValid = await this.roomDurationService.compareDurationWithParentRoom(req.roomId, req.duration);
            if (!isValid) {
                throw new Error('Duration comparison with parent room failed');
            }
        }

        // 3. Prepare Sub-Room Metadata Template
        // Clone metadata to modify for breakout rooms
        const bMeta = create(RoomMetadataSchema, meta);
        if (!bMeta.roomFeatures) bMeta.roomFeatures = {};

        bMeta.roomFeatures.roomDuration = BigInt(req.duration);
        bMeta.isBreakoutRoom = true;
        bMeta.welcomeMessage = req.welcomeMsg;
        bMeta.parentRoomId = req.roomId;

        // Disable features for breakout rooms
        if (bMeta.roomFeatures.breakoutRoomFeatures) bMeta.roomFeatures.breakoutRoomFeatures.isAllow = false;
        if (bMeta.roomFeatures.waitingRoomFeatures) bMeta.roomFeatures.waitingRoomFeatures.isActive = false;
        if (bMeta.roomFeatures.recordingFeatures) bMeta.roomFeatures.recordingFeatures.isAllow = false;
        if (bMeta.roomFeatures.chatFeatures) bMeta.roomFeatures.chatFeatures.allowFileUpload = false; // Usually disabled in BkRooms
        bMeta.allowRtmp = false;

        if (bMeta.roomFeatures.displayExternalLinkFeatures) bMeta.roomFeatures.displayExternalLinkFeatures.isActive = false;
        if (bMeta.roomFeatures.externalMediaPlayerFeatures) bMeta.roomFeatures.externalMediaPlayerFeatures.isActive = false;

        const errorMap: Record<string, boolean> = {};

        // 4. Create Each Breakout Room
        for (const room of req.rooms) {
            const bRoomId = `${req.roomId}-${room.id}`;
            const roomLogKey = `[Breakout ${bRoomId}]`;

            try {
                // Prepare CreateRoomReq
                const createReq = create(CreateRoomReq, {
                    roomId: bRoomId,
                    metadata: create(RoomMetadataSchema, {
                        ...bMeta,
                        roomTitle: room.title
                    })
                });

                // Create Room via existing service
                await this.roomCreateService.createRoom(createReq);

                // Update room object with created info
                room.duration = BigInt(req.duration);
                room.created = BigInt(Math.floor(Date.now() / 1000));

                // Marshal to store in NATS KV
                // We use toJsonString for storage to match Go's protojson behavior which NATS KV expects?
                // Actually in nats-room.service we used Uint8Array for `put`. 
                // Let's use `toBinary` for efficient storage if consumers are also protobuf aware.
                // However, the Go code uses `protojson.Marshal`. 
                // So we should store as JSON string bytes.
                const roomJson = toJsonString(BreakoutRoomSchema, room, { emitDefaultValues: true });
                await this.natsRoomService.insertOrUpdateBreakoutRoom(req.roomId, bRoomId, new TextEncoder().encode(roomJson));

                // Send Invitations
                for (const u of room.users) {
                    await this.natsSystemEvents.broadcastSystemEventToRoom(
                        NatsMsgServerToClientEvents.JOIN_BREAKOUT_ROOM,
                        req.roomId,
                        bRoomId, // sending breakout room ID as message
                        u.id
                    );
                }

            } catch (error) {
                this.logger.error(`${roomLogKey} Failed to create: ${error.message}`);
                errorMap[bRoomId] = true;
            }
        }

        if (req.rooms.length > 0 && Object.keys(errorMap).length === req.rooms.length) {
            throw new Error("Breakout room creation wasn't successful for any room");
        }

        // 5. Update Parent Room Metadata
        const parentMeta = this.natsService.unmarshalRoomMetadata(mainRoom.metadata);
        if (!parentMeta.roomFeatures) parentMeta.roomFeatures = {};
        if (!parentMeta.roomFeatures.breakoutRoomFeatures) parentMeta.roomFeatures.breakoutRoomFeatures = {};

        parentMeta.roomFeatures.breakoutRoomFeatures.isActive = true;

        await this.natsRoomService.updateRoomMetadata(req.roomId, parentMeta);

        // Broadcast metadata update
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            req.roomId,
            this.natsService.marshalRoomMetadata(parentMeta)
        );

        this.logger.log(`Finished creating breakout rooms for ${req.roomId}`);
    }

    /**
     * JoinBreakoutRoom validates and generates token for joining a breakout room
     */
    async joinBreakoutRoom(req: JoinBreakoutRoomReq): Promise<string> {
        this.logger.log(`User ${req.userId} requesting to join breakout room ${req.breakoutRoomId}`);

        // 1. Check if user already joined
        const status = await this.natsUserService.getRoomUserStatus(req.breakoutRoomId, req.userId);
        if (status === USER_STATUS_ONLINE) {
            throw new Error('User has already been joined');
        }

        // 2. Fetch Breakout Room Info
        const roomBytes = await this.natsRoomService.getBreakoutRoom(req.roomId, req.breakoutRoomId);
        if (!roomBytes) {
            throw new Error('Failed to fetch breakout room info');
        }

        const room = fromJsonString(BreakoutRoomSchema, new TextDecoder().decode(roomBytes));

        // 3. Authorization Check (Unless Admin)
        if (!req.isAdmin) {
            const canJoin = room.users.some(u => u.id === req.userId);
            if (!canJoin) {
                throw new Error('User is not allowed to join this breakout room');
            }
        }

        // 4. Get User Info from Parent Room
        const { info: pInfo, metadata: pMeta } = await this.natsUserService.getUserWithMetadata(req.roomId, req.userId);
        if (!pInfo || !pMeta) {
            throw new Error('Failed to get user info from parent room');
        }

        // 5. Generate Token
        // Using RoomService (via RoomModule) or similar to generate token? 
        // Need to use the same logic as direct join. 
        // Breakout rooms are just normal rooms in LiveKit perspective.

        // We reuse RoomCreateService's join logic if possible, but here we just need a token.
        // Go: m.um.GetPNMJoinToken(ctx, req)

        const genTokenReq = create(GenerateTokenReq, {
            roomId: req.breakoutRoomId,
            userInfo: create(UserInfo, {
                userId: req.userId,
                name: pInfo.name,
                isAdmin: pMeta.isAdmin,
                userMetadata: pMeta,
            })
        });

        // We need access to token generation. Ideally via RoomService or similar.
        // Assuming RoomService has getJoinToken method.
        return this.roomService.getJoinToken(genTokenReq);
    }

    /**
     * EndBreakoutRoom ends a specific breakout room via RoomEndService
     */
    async endBreakoutRoom(req: EndBreakoutRoomReq): Promise<void> {
        this.logger.log(`Ending breakout room ${req.breakoutRoomId} for parent ${req.roomId}`);

        const rm = await this.natsRoomService.getBreakoutRoom(req.roomId, req.breakoutRoomId);
        if (!rm) {
            throw new Error('Breakout room not found');
        }

        // Use core end room logic
        await this.roomEndService.endRoom(req.breakoutRoomId);

        // Delete from NATS KV
        await this.natsRoomService.deleteBreakoutRoom(req.roomId, req.breakoutRoomId);

        // Post-End Cleanup & Notification
        await this.onAfterBkRoomEnded(req.roomId, req.breakoutRoomId);
    }

    /**
     * EndAllBreakoutRooms ends all sub-rooms for a parent room
     */
    async endAllBreakoutRooms(parentRoomId: string): Promise<void> {
        this.logger.log(`Ending all breakout rooms for ${parentRoomId}`);

        const ids = await this.natsRoomService.getBreakoutRoomIdsByParentRoomId(parentRoomId);
        if (!ids || ids.length === 0) {
            await this.updateParentRoomMetadataOnEnd(parentRoomId);
            return;
        }

        for (const id of ids) {
            await this.roomEndService.endRoom(id);
            await this.natsRoomService.deleteBreakoutRoom(parentRoomId, id);
            await this.onAfterBkRoomEnded(parentRoomId, id);
        }
    }

    /**
     * GetBreakoutRoomsInfo returns list of breakout rooms
     */
    async getBreakoutRoomsInfo(roomId: string): Promise<BreakoutRoom[]> {
        const roomsData = await this.natsRoomService.getAllBreakoutRoomsByParentRoomId(roomId);
        const result: BreakoutRoom[] = [];

        for (const [key, val] of Object.entries(roomsData)) {
            try {
                const room = fromJsonString(BreakoutRoomSchema, new TextDecoder().decode(val));
                room.id = key; // Ensure ID matches map key

                // Check online status of users
                if (room.started) {
                    for (const u of room.users) {
                        const status = await this.natsUserService.getRoomUserStatus(key, u.id);
                        if (status === USER_STATUS_ONLINE) {
                            u.joined = true;
                        }
                    }
                }
                result.push(room);
            } catch (e) {
                this.logger.warn(`Failed to parse breakout room ${key}: ${e.message}`);
            }
        }
        return result;
    }

    /**
     * IncreaseBreakoutRoomDuration extends duration
     */
    async increaseBreakoutRoomDuration(req: IncreaseBreakoutRoomDurationReq): Promise<void> {
        const roomBytes = await this.natsRoomService.getBreakoutRoom(req.roomId, req.breakoutRoomId);
        if (!roomBytes) throw new Error('Breakout room not found');

        const room = fromJsonString(BreakoutRoomSchema, new TextDecoder().decode(roomBytes));

        // Update active duration checker
        const newDuration = await this.roomDurationService.increaseRoomDuration(req.breakoutRoomId, req.duration);

        // Update KV
        room.duration = BigInt(newDuration);
        const jsonStr = toJsonString(BreakoutRoomSchema, room, { emitDefaultValues: true });

        await this.natsRoomService.insertOrUpdateBreakoutRoom(req.roomId, req.breakoutRoomId, new TextEncoder().encode(jsonStr));
    }

    /**
     * BroadcastBreakoutRoomMsg sends a system message to all breakout rooms
     */
    async broadcastBreakoutRoomMsg(req: BroadcastBreakoutRoomMsgReq): Promise<void> {
        const rooms = await this.getBreakoutRoomsInfo(req.roomId);
        if (rooms.length === 0) return;

        for (const r of rooms) {
            await this.natsSystemEvents.broadcastSystemEventToRoom(
                NatsMsgServerToClientEvents.SYSTEM_CHAT_MSG,
                r.id,
                req.msg
            );
        }
    }

    /**
     * PostTaskAfterRoomStartWebhook handles post-start updates (setting created time, etc.)
     */
    async postTaskAfterRoomStartWebhook(roomId: string, metadata: RoomMetadata): Promise<void> {
        if (!metadata.isBreakoutRoom || !metadata.parentRoomId) return;

        // Delay to allow sync
        await new Promise(resolve => setTimeout(resolve, this.waitBeforePostStart));

        const roomBytes = await this.natsRoomService.getBreakoutRoom(metadata.parentRoomId, roomId);
        if (!roomBytes) return;

        const room = fromJsonString(BreakoutRoomSchema, new TextDecoder().decode(roomBytes));
        room.created = metadata.startedAt;
        room.started = true;

        const jsonStr = toJsonString(BreakoutRoomSchema, room, { emitDefaultValues: true });
        await this.natsRoomService.insertOrUpdateBreakoutRoom(metadata.parentRoomId, roomId, new TextEncoder().encode(jsonStr));
    }

    /**
     * PostTaskAfterRoomEndWebhook handles cleanup when a room ends
     */
    async postTaskAfterRoomEndWebhook(roomId: string, metadata: string): Promise<void> {
        if (!metadata) return;

        const meta = this.natsService.unmarshalRoomMetadata(metadata);

        if (meta.isBreakoutRoom && meta.parentRoomId) {
            // A single breakout room ended
            await this.natsRoomService.deleteBreakoutRoom(meta.parentRoomId, roomId);
            await this.onAfterBkRoomEnded(meta.parentRoomId, roomId);
        } else {
            // Parent room ended, kill all sub-rooms
            await this.endAllBreakoutRooms(roomId);
        }
    }

    // ================= PRIVATE METHODS =================

    private async onAfterBkRoomEnded(parentRoomId: string, bkRoomId: string) {
        const count = await this.natsRoomService.countBreakoutRooms(parentRoomId);

        if (count === 0) {
            // No rooms left, cleanup parent metadata
            await this.natsRoomService.deleteAllBreakoutRoomsByParentRoomId(parentRoomId);
            await this.updateParentRoomMetadataOnEnd(parentRoomId);
        }

        // Notify parent room
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.BREAKOUT_ROOM_ENDED,
            parentRoomId,
            bkRoomId
        );
    }

    private async updateParentRoomMetadataOnEnd(parentRoomId: string) {
        const meta = await this.natsRoomService.getRoomMetadataStruct(parentRoomId);
        if (!meta) return;

        if (meta.roomFeatures?.breakoutRoomFeatures?.isActive) {
            meta.roomFeatures.breakoutRoomFeatures.isActive = false;

            await this.natsRoomService.updateRoomMetadata(parentRoomId, meta);
            await this.natsSystemEvents.broadcastSystemEventToRoom(
                NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
                parentRoomId,
                this.natsService.marshalRoomMetadata(meta)
            );
        }
    }
}
