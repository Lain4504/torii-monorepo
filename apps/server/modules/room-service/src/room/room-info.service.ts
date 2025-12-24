/**
 * Room Info Service
 * Equivalent to Go: plugNmeet-server/pkg/models/room_info.go
 * 
 * Handles room information and status queries
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type {
    IsRoomActiveReq,
    IsRoomActiveRes,
    GetActiveRoomInfoReq,
    ActiveRoomWithParticipant,
    ActiveRoomInfo,
    FetchPastRoomsReq,
    FetchPastRoomsResult,
    PastRoomInfo,
    NatsKvRoomInfo,
    RoomMetadata,
} from '@workspace/protocol';
import {
    IsRoomActiveResSchema,
    ActiveRoomWithParticipantSchema,
    ActiveRoomInfoSchema,
    FetchPastRoomsResultSchema,
    PastRoomInfoSchema,
} from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import { NatsService } from '../nats/nats.service';
import { NatsRoomService } from '../nats/nats-room.service';
import { NatsUserInfoService, USER_METADATA_KEY } from '../nats/nats-user-info.service';
import { RedisLockService } from '../redis/redis-lock.service';
import { LiveKitService } from '../livekit/livekit.service';
import { waitUntilRoomCreationCompletes } from './room-lock.helper';

/**
 * RoomInfoService handles room information and status queries
 * Equivalent to Go: RoomModel methods in room_info.go
 */
@Injectable()
export class RoomInfoService {
    private readonly logger = new Logger(RoomInfoService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly natsService: NatsService,
        private readonly natsRoomService: NatsRoomService,
        private readonly natsUserInfoService: NatsUserInfoService,
        private readonly redisLock: RedisLockService,
        private readonly livekitService: LiveKitService,
    ) { }

    /**
     * IsRoomActive checks if a room is currently active
     * Equivalent to Go: m.IsRoomActive
     * 
     * @returns IsRoomActiveRes, roomDbInfo, rInfo, metadata
     */
    async isRoomActive(
        req: IsRoomActiveReq,
    ): Promise<{
        res: IsRoomActiveRes;
        roomDbInfo: any | null;
        rInfo: NatsKvRoomInfo | null;
        metadata: RoomMetadata | null;
        meta?: RoomMetadata | null; // alias to mirror Go return shape
    }> {
        const log = this.logger;
        log.log(`IsRoomActive check: ${req.roomId}`);

        // Wait until room creation completes (matching Go)
        await waitUntilRoomCreationCompletes(this.redisLock, req.roomId, log);

        const res = create(IsRoomActiveResSchema, {
            status: true,
            msg: 'room is not active',
            isActive: false,
        });

        // Check database first
        const roomDbInfo = await this.getRoomInfoByRoomId(req.roomId, true);
        if (!roomDbInfo || !roomDbInfo.id) {
            res.status = false;
            res.msg = 'Room not found in database';
            return { res, roomDbInfo: null, rInfo: null, metadata: null };
        }

        // Check NATS for actual room info (matching Go: m.natsService.GetRoomInfoWithMetadata)
        const { info: rInfo, metadata } = await this.natsRoomService.getRoomInfoWithMetadata(req.roomId);

        if (!rInfo || !metadata) {
            // Room isn't active. Change status in DB
            await this.updateRoomStatus(req.roomId, false);
            return { res, roomDbInfo: null, rInfo: null, metadata: null };
        }

        // Check room status (matching Go: RoomStatusCreated || RoomStatusActive)
        if (rInfo.status === 'created' || rInfo.status === 'active') {
            res.isActive = true;
            res.msg = 'room is active';
        }

        // Return full context for callers that need both DB and KV data (matches Go signature)
        return { res, roomDbInfo, rInfo, metadata, meta: metadata };
    }

    /**
     * GetActiveRoomInfo gets detailed info about an active room
     * Equivalent to Go: m.GetActiveRoomInfo
     * 
     * @returns [success, message, roomWithParticipants]
     */
    async getActiveRoomInfo(
        req: GetActiveRoomInfoReq,
    ): Promise<{ success: boolean; message: string; data: ActiveRoomWithParticipant | null }> {
        const log = this.logger;
        log.log(`GetActiveRoomInfo: ${req.roomId}`);

        // Wait until room creation completes
        await waitUntilRoomCreationCompletes(this.redisLock, req.roomId, log);

        // Get room from database
        const roomDbInfo = await this.getRoomInfoByRoomId(req.roomId, true);
        if (!roomDbInfo || !roomDbInfo.id) {
            return { success: false, message: 'no room found', data: null };
        }

        // Get room info from NATS (matching Go: m.natsService.GetRoomInfo)
        const rrr = await this.natsRoomService.getRoomInfo(req.roomId);
        if (!rrr || (rrr.status !== 'created' && rrr.status !== 'active')) {
            // Room is not in NATS or not active, mark as ended in DB
            log.warn(`Room found in DB but not active in NATS (status: ${rrr?.status}), marking as ended`);
            await this.updateRoomStatus(req.roomId, false);
            return { success: false, message: 'room is not active', data: null };
        }

        // Build response
        const res = create(ActiveRoomWithParticipantSchema, {
            roomInfo: create(ActiveRoomInfoSchema, {
                roomTitle: roomDbInfo.roomTitle,
                roomId: roomDbInfo.roomId,
                sid: roomDbInfo.sid,
                joinedParticipants: roomDbInfo.joinedParticipants,
                isRunning: roomDbInfo.isRunning,
                isRecording: roomDbInfo.isRecording,
                isActiveRtmp: roomDbInfo.isActiveRtmp,
                webhookUrl: roomDbInfo.webhookUrl,
                isBreakoutRoom: roomDbInfo.isBreakoutRoom,
                parentRoomId: roomDbInfo.parentRoomId,
                creationTime: roomDbInfo.creationTime.toString(),
                metadata: rrr.metadata,
            }),
            participantsInfo: [],
        });

        // Load participants from LiveKit
        try {
            const participants = await this.livekitService.loadParticipants(roomDbInfo.roomId);
            if (participants && participants.length > 0) {
                for (const participant of participants) {
                    // Get user metadata from NATS (matching Go: m.natsService.GetUserKeyValue)
                    const entry = await this.natsUserInfoService.getUserKeyValue(
                        roomDbInfo.roomId,
                        participant.identity,
                        USER_METADATA_KEY
                    );
                    if (entry && entry.value) {
                        participant.metadata = new TextDecoder().decode(entry.value);
                    }
                    res.participantsInfo.push(participant);
                }
            }
        } catch (error) {
            this.logger.warn(`Failed to load participants: ${error.message}`);
        }

        return { success: true, message: 'success', data: res };
    }

    /**
     * GetActiveRoomsInfo gets all active rooms with participants
     * Equivalent to Go: m.GetActiveRoomsInfo
     * 
     * @returns [success, message, rooms]
     */
    async getActiveRoomsInfo(): Promise<{
        success: boolean;
        message: string;
        data: ActiveRoomWithParticipant[] | null;
    }> {
        // Get all active rooms from database
        const roomsInfo = await this.getActiveRoomsFromDb();
        if (!roomsInfo || roomsInfo.length === 0) {
            return { success: false, message: 'no active room found', data: null };
        }

        const res: ActiveRoomWithParticipant[] = [];

        for (const r of roomsInfo) {
            const i = create(ActiveRoomWithParticipantSchema, {
                roomInfo: create(ActiveRoomInfoSchema, {
                    roomTitle: r.roomTitle,
                    roomId: r.roomId,
                    sid: r.sid,
                    joinedParticipants: r.joinedParticipants,
                    isRunning: r.isRunning,
                    isRecording: r.isRecording,
                    isActiveRtmp: r.isActiveRtmp,
                    webhookUrl: r.webhookUrl,
                    isBreakoutRoom: r.isBreakoutRoom,
                    parentRoomId: r.parentRoomId,
                    creationTime: r.creationTime.toString(),
                }),
                participantsInfo: [],
            });

            // Get room metadata from NATS (matching Go: m.natsService.GetRoomInfo)
            const rri = await this.natsRoomService.getRoomInfo(r.roomId);
            if (!rri) {
                continue;
            }
            i.roomInfo!.metadata = rri.metadata;

            // Load participants from LiveKit
            try {
                const participants = await this.livekitService.loadParticipants(r.roomId);
                if (participants && participants.length > 0) {
                    for (const participant of participants) {
                        // Get user metadata from NATS (matching Go: m.natsService.GetUserKeyValue)
                        const entry = await this.natsUserInfoService.getUserKeyValue(
                            r.roomId,
                            participant.identity,
                            USER_METADATA_KEY
                        );
                        if (entry && entry.value) {
                            participant.metadata = new TextDecoder().decode(entry.value);
                        }
                        i.participantsInfo.push(participant);
                    }
                }
            } catch (error) {
                this.logger.warn(`Failed to load participants for room ${r.roomId}: ${error.message}`);
            }

            res.push(i);
        }

        return { success: true, message: 'success', data: res };
    }

    /**
     * FetchPastRooms fetches historical room records with pagination
     * Equivalent to Go: m.FetchPastRooms
     */
    async fetchPastRooms(req: FetchPastRoomsReq): Promise<FetchPastRoomsResult> {
        // Validate and set defaults (matching Go)
        let limit = req.limit || 20;
        if (limit > 100) {
            limit = 100;
        }

        const orderBy = req.orderBy || 'DESC';
        const from = req.from || 0;

        // Fetch from database
        const { rooms, total } = await this.getPastRoomsFromDb(
            req.roomIds || [],
            from,
            limit,
            orderBy,
        );

        const list: PastRoomInfo[] = [];

        for (const rr of rooms) {
            const room = create(PastRoomInfoSchema, {
                roomTitle: rr.roomTitle,
                roomId: rr.roomId,
                roomSid: rr.sid,
                joinedParticipants: rr.joinedParticipants,
                webhookUrl: rr.webhookUrl,
                created: rr.created.toISOString(),
                ended: rr.ended.toISOString(),
            });

            // Get analytics file ID if available
            // TODO: Implement when RoomArtifact model is added to Prisma schema
            // Matching Go: m.ds.GetAnalyticByRoomTableId(rr.ID)
            /* 
            try {
                const analytics = await this.getAnalyticByRoomTableId(rr.id);
                if (analytics) {
                room.analyticsFileId = analytics.artifactId;
                }
            } catch (error) {
                // Silently ignore analytics fetch errors
            }
            */

            list.push(room);
        }

        return create(FetchPastRoomsResultSchema, {
            totalRooms: total.toString(),  // uint64 as string
            from: from,
            limit: limit,
            orderBy: orderBy,
            roomsList: list,
        });
    }

    // ============================================================================
    // Private Helper Methods (Database operations)
    // ============================================================================

    /**
     * Get room info by roomId from database
     * Matching Go: m.ds.GetRoomInfoByRoomId(r.RoomId, 1)
     * 
     * Made public for use by RoomEndService
     */
    async getRoomInfoByRoomId(roomId: string, isRunning: boolean): Promise<any | null> {
        try {
            return await this.prisma.roomInfo.findFirst({
                where: {
                    roomId: roomId,
                    isRunning: isRunning ? 1 : 0,  // int type: 0 or 1
                },
                orderBy: {
                    id: 'desc',
                },
            });
        } catch (error) {
            this.logger.error(`Failed to get room info: ${error.message}`);
            return null;
        }
    }

    /**
     * Update room status in database
     * Matching Go: m.ds.UpdateRoomStatus(&dbmodels.RoomInfo{RoomId: r.RoomId, IsRunning: 0})
     * 
     * Made public for use by RoomEndService
     */
    async updateRoomStatus(roomId: string, isRunning: boolean): Promise<void> {
        try {
            const updates: any = {
                isRunning: isRunning ? 1 : 0,  // int type: 0 or 1
            };

            // If ending room, also update related fields (matching Go: room_modify.go line 26-30)
            if (!isRunning) {
                updates.isRecording = 0;
                updates.isActiveRtmp = 0;
                updates.ended = new Date();
            }

            await this.prisma.roomInfo.updateMany({
                where: { roomId },
                data: updates,
            });
        } catch (error) {
            this.logger.error(`Failed to update room status: ${error.message}`);
        }
    }

    // Note: getRoomInfoWithMetadata is now handled by NatsRoomService directly
    // No need for private helper method - using natsRoomService.getRoomInfoWithMetadata()

    /**
     * Get all active rooms from database
     * Matching Go: rooms, err := m.ds.GetActiveRoomsInfo()
     */
    private async getActiveRoomsFromDb(): Promise<any[]> {
        try {
            return await this.prisma.roomInfo.findMany({
                where: { isRunning: 1 },  // int type: 1 means active
            });
        } catch (error) {
            this.logger.error(`Failed to get active rooms: ${error.message}`);
            return [];
        }
    }

    /**
     * Get past rooms from database with pagination
     * Matching Go: rooms, total, err := m.ds.GetPastRooms(r.RoomIds, uint64(r.From), uint64(r.Limit), &r.OrderBy)
     */
    private async getPastRoomsFromDb(
        roomIds: string[],
        from: number,
        limit: number,
        orderBy: string,
    ): Promise<{ rooms: any[]; total: number }> {
        try {
            const where: any = { isRunning: 0 };  // int type: 0 means ended
            if (roomIds.length > 0) {
                where.roomId = { in: roomIds };
            }

            const [rooms, total] = await Promise.all([
                this.prisma.roomInfo.findMany({
                    where,
                    skip: from,
                    take: limit,
                    orderBy: { created: orderBy === 'ASC' ? 'asc' : 'desc' },
                }),
                this.prisma.roomInfo.count({ where }),
            ]);

            return { rooms, total };
        } catch (error) {
            this.logger.error(`Failed to get past rooms: ${error.message}`);
            return { rooms: [], total: 0 };
        }
    }

    /**
     * Get analytics by room table ID
     * Matching Go: m.ds.GetAnalyticByRoomTableId(rr.ID)
     * 
     * TODO: Uncomment and implement when RoomArtifact model is added to Prisma schema
     */
    /*
    private async getAnalyticByRoomTableId(roomTableId: number): Promise<{ artifactId: string } | null> {
        try {
            // Use RoomArtifact model (matching Go: dbmodels.RoomArtifact table)
            const analytics = await this.prisma.roomArtifact.findFirst({
                where: { roomTableId: BigInt(roomTableId) },
                select: { artifactId: true },
            });
            return analytics;
        } catch (error) {
            this.logger.error(`Failed to get analytics: ${error.message}`);
            return null;
        }
    }
    */
}
