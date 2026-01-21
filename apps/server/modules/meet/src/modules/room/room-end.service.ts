/**
 * Room End Service
 *
 * Handles room termination and cleanup operations
 */

import { Injectable, Logger } from '@nestjs/common';
import type { RoomEndReq } from '@workspace/protocol';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { NatsStreamService } from '../../interfaces/nats/nats-stream.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { RedisLockService } from '../../infrastructure/redis/redis-lock.service';
import { RedisRoomService } from '../../infrastructure/redis/redis-room.service';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';
import { NatsMsgServerToClientEvents } from '@workspace/protocol';
import { waitUntilRoomCreationCompletes } from './room-lock.helper';
import { RoomInfoService } from './room-info.service';
import { RoomDurationService } from './room-duration.service';
import { PollsService } from "../polls/polls.service";
import { AnalyticsService } from '../analytics/analytics.service';

/**
 * RoomEndService handles room termination and cleanup
 */
@Injectable()
export class RoomEndService {
    private readonly logger = new Logger(RoomEndService.name);

    constructor(
        private readonly natsRoomService: NatsRoomService,
        private readonly natsSystemEvents: NatsSystemEventsService,
        private readonly natsStreamService: NatsStreamService,
        private readonly natsUserService: NatsUserService,
        private readonly redisLock: RedisLockService,
        private readonly redisRoom: RedisRoomService,
        private readonly livekit: LiveKitService,
        private readonly roomInfoService: RoomInfoService,
        private readonly roomDuration: RoomDurationService,
        private readonly pollsService: PollsService,
        private readonly analyticsService: AnalyticsService,
    ) { }

    /**
     * EndRoom terminates a room session

     * 
     * Steps:
     * 1. Wait for room creation lock
     * 2. Get room from DB
     * 3. Get room from NATS
     * 4. Cache temporary data in Redis
     * 5. Broadcast SESSION_ENDED event
     * 6. Trigger async cleanup
     * 
     * @param req - RoomEndReq request
     * @returns { status: boolean, msg: string }
     */
    async endRoom(req: RoomEndReq): Promise<{ status: boolean; msg: string }> {
        const roomId = req.roomId;
        this.logger.log(`EndRoom called for: ${roomId}`);

        // Step 1: Wait until any ongoing room creation process is complete to avoid race conditions

        try {
            await waitUntilRoomCreationCompletes(this.redisLock, roomId, this.logger);
        } catch (error) {
            this.logger.error(`Cannot end room as it's locked: ${error.message}`);
            return { status: false, msg: `Failed to end room: ${error.message}` };
        }

        this.logger.log(`Proceeding to end room: ${roomId}`);

        // Step 2: Fetch room information from the database
        // Use RoomInfoService instead of direct Prisma call
        const roomDbInfo = await this.roomInfoService.getRoomInfoByRoomId(roomId, true);

        if (!roomDbInfo) {
            return { status: false, msg: 'room not found in DB or not active' };
        }

        // Step 3: Fetch the live room state from the NATS key-value store
        let natsRoomInfo;
        try {
            natsRoomInfo = await this.natsRoomService.getRoomInfo(roomId);
        } catch (error) {
            this.logger.warn(`NATS GetRoomInfo failed during EndRoom: ${error.message}. Proceeding with DB cleanup.`);
        }

        // Step 4: Handle cases where the room exists in the DB but not in NATS
        if (!natsRoomInfo) {
            if (roomDbInfo.isRunning === 1) {
                this.logger.warn(`Room active in DB but not in NATS during EndRoom. Marking as ended and cleaning up.`);
                // Trigger cleanup asynchronously
                setImmediate(() => {
                    this.onAfterRoomEnded(
                        BigInt(roomDbInfo.id),
                        roomDbInfo.roomId,
                        roomDbInfo.sid,
                        '',
                        '',
                    );
                });
            }
            return { status: true, msg: 'room ended (NATS info was missing, cleanup initiated)' };
        }

        // Step 5: Temporarily cache the live room data in Redis
        // This serves as a fallback in case the 'room_finished' webhook from LiveKit is delayed
        try {
            await this.redisRoom.holdTemporaryRoomData(natsRoomInfo);
        } catch (error) {
            this.logger.warn(`Failed to cache room data: ${error.message}`);
        }

        // Step 6: Broadcast a 'SESSION_ENDED' event to all clients in the room
        try {
            await this.natsSystemEvents.broadcastSystemEventToRoom(
                NatsMsgServerToClientEvents.SESSION_ENDED,
                roomId,
                'notifications.room-disconnected-room-ended',
            );
        } catch (error) {
            this.logger.error(`Error sending session ended notification: ${error.message}`);
        }

        // Step 7: Trigger the main asynchronous cleanup process
        setImmediate(() => {
            this.onAfterRoomEnded(
                BigInt(natsRoomInfo.dbTableId),
                natsRoomInfo.roomId,
                natsRoomInfo.roomSid,
                natsRoomInfo.metadata,
                natsRoomInfo.status,
            );
        });

        return { status: true, msg: 'success' };
    }

    /**
     * OnAfterRoomEnded performs comprehensive cleanup after room ends

     * 
     * This is called asynchronously and performs extensive cleanup:
     * - Database updates
     * - NATS cleanup
     * - LiveKit cleanup
     * - File deletion
     * - Analytics export
     * 
     * @param dbTableId - Database table ID
     * @param roomId - Room ID
     * @param roomSID - Room session ID
     * @param metadata - Room metadata JSON string
     * @param roomStatus - Current room status
     */
    private async onAfterRoomEnded(
        dbTableId: bigint,
        roomId: string,
        roomSID: string,
        metadata: string,
        roomStatus: string,
    ): Promise<void> {
        this.logger.log(`Starting room cleanup for: ${roomId}, sid: ${roomSID}, status: ${roomStatus}`);

        // Step 1: Acquire a distributed lock to prevent race conditions
        const cleanupLockTTL = 60000; // 60 seconds
        let lockValue: string;

        try {
            const lock = await this.redisLock.lockRoomCreation(roomId, cleanupLockTTL);
            if (!lock.acquired) {
                this.logger.warn(`Could not acquire room creation lock for cleanup: ${roomId}`);
                return;
            }
            lockValue = lock.lockValue;
            this.logger.log(`Room creation lock acquired for cleanup: ${roomId}, lockVal: ${lockValue}`);
        } catch (error) {
            this.logger.error(`Redis error acquiring room creation lock: ${error.message}`);
            return;
        }

        // Step 2: Ensure lock is always released
        try {
            await this.performCleanup(dbTableId, roomId, roomSID, metadata, roomStatus);
        } finally {
            try {
                await this.redisLock.unlockRoomCreation(roomId, lockValue);
                this.logger.log(`Room creation lock released for cleanup: ${roomId}, lockVal: ${lockValue}`);
            } catch (error) {
                this.logger.error(`Error releasing cleanup lock: ${error.message}`);
            }
        }
    }

    /**
     * PerformCleanup executes all cleanup steps
     * 
     * @private
     */
    private async performCleanup(
        dbTableId: bigint,
        roomId: string,
        roomSID: string,
        metadata: string,
        roomStatus: string,
    ): Promise<void> {
        // Step 3: If the room wasn't ended via the API, update status in NATS and LiveKit
        if (roomStatus !== 'ended') {
            try {
                await this.natsRoomService.updateRoomStatus(roomId, 'ended');
            } catch (error) {
                this.logger.error(`Error updating room status in NATS: ${error.message}`);
            }

            try {
                await this.livekit.endRoom(roomId);
            } catch (error) {
                this.logger.error(`Error ending room in LiveKit: ${error.message}`);
            }
        }

        // Step 4: Mark the room as not running in the database
        // Use RoomInfoService instead of direct Prisma call
        try {
            await this.roomInfoService.updateRoomStatus(roomId, false);
        } catch (error) {
            this.logger.error(`DB error updating room status: ${error.message}`);
        }

        // Step 5: Clear any user blocklists associated with the room
        try {
            await this.natsUserService.deleteRoomUsersBlockList(roomId);
        } catch (error) {
            this.logger.error(`Error deleting room users blocklist: ${error.message}`);
        }

        // Step 6: Send a stop signal to any active recorders for this room
        // TODO: Implement recorder model
        // await this.recorderModel.sendMsgToRecorder({ task: 'STOP', sid: roomSID, roomId: roomId });

        // Step 7: Delete all uploaded files for this session (if not configured to keep)
        // TODO: Implement file model
        // if (!this.configService.get('UPLOAD_KEEP_FOREVER')) {
        //     await this.fileModel.deleteRoomUploadedDir(roomSID);
        // }

        // Step 8: Remove the room from the duration checker
        try {
            await this.roomDuration.deleteRoomWithDuration(roomId);
        } catch (error) {
            this.logger.error(`Error deleting room duration: ${error.message}`);
        }

        // Step 9: Clean up any associated Etherpad (shared notepad) pads
        // TODO: Implement Etherpad model
        // await this.etherpadModel.cleanAfterRoomEnd(roomId, metadata);

        // Step 10: Clean up any polls created during the session
        try {
            await this.pollsService.cleanUpPolls(roomId);
        } catch (error) {
            this.logger.error(`Error cleaning up polls: ${error.message}`);
        }

        // Step 11: Perform post-end tasks for breakout rooms, if any
        // TODO: Implement breakout room model
        // await this.breakoutModel.postTaskAfterRoomEndWebhook(roomId, metadata);

        // Step 12: Finalize and clean up any speech-to-text service usage stats
        // TODO: Implement speech service
        // await this.speechToText.onAfterRoomEnded(roomId, roomSID);

        // Step 13: End all the agent tasks for this room
        // TODO: Implement insights model
        // await this.insightsModel.onAfterRoomEnded(dbTableId, roomId, roomSID);

        // Step 14: Perform the final NATS cleanup
        try {
            await this.natsRoomService.onAfterSessionEndCleanup(roomId);
        } catch (error) {
            this.logger.error(`Error in NATS cleanup: ${error.message}`);
        }

        this.logger.log(`Room has been cleaned properly: ${roomId}`);

        // Step 15: Schedule the analytics export to run after a delay
        setTimeout(() => {
            this.analyticsService.prepareToExportAnalytics(roomId, roomSID, metadata);
        }, 10000); // 10 seconds delay
    }
}
