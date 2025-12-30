/**
 * Waiting Room Service
 * 
 * Handles waiting room operations:
 * - Approving users from waiting room
 * - Updating waiting room messages
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsUserInfoService } from '../../interfaces/nats/nats-user-info.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsRoomEventsService } from '../../interfaces/nats/nats-room-events.service';
import type { ApproveWaitingUsersReq, UpdateWaitingRoomMessageReq } from '@workspace/protocol';

/**
 * Service for managing waiting room operations
 */
@Injectable()
export class WaitingRoomService {
    private readonly logger = new Logger(WaitingRoomService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly natsService: NatsService,
        private readonly natsUserInfoService: NatsUserInfoService,
        private readonly natsUserService: NatsUserService,
        private readonly natsRoomService: NatsRoomService,
        private readonly natsRoomEventsService: NatsRoomEventsService,
    ) { }

    /**
     * approveWaitingUsers approves one or all users from the waiting room
     * 
     * @param req - Approval request containing roomId and userId (or "all")
     */
    async approveWaitingUsers(req: ApproveWaitingUsersReq): Promise<void> {
        const log = this.logger;
        log.log(`Approving waiting users in room ${req.roomId}, userId: ${req.userId}`);

        // If approving all users
        if (req.userId === 'all') {
            log.log('Approving all waiting users');

            // Get all online users
            const participants = await this.natsUserInfoService.getOnlineUsersList(req.roomId);
            if (!participants || participants.length === 0) {
                log.warn('No participants found in room');
                return;
            }

            // Approve each user
            for (const p of participants) {
                try {
                    await this.approveUser(req.roomId, p.userId, p.metadata);
                } catch (error) {
                    log.error(`Error approving user ${p.userId}: ${error.message}`);
                }
            }

            return;
        }

        // Approve single user
        const userInfo = await this.natsUserInfoService.getUserInfo(req.roomId, req.userId);
        if (!userInfo) {
            throw new Error('user not found');
        }

        await this.approveUser(req.roomId, req.userId, userInfo.metadata);
    }

    /**
     * approveUser approves a single user by updating their metadata
     * 
     * @param roomId - Room ID
     * @param userId - User ID to approve
     * @param metadata - User metadata JSON string
     */
    private async approveUser(roomId: string, userId: string, metadata: string): Promise<void> {
        // Unmarshal user metadata
        const mt = this.natsService.unmarshalUserMetadata(metadata);
        if (!mt) {
            throw new Error('Failed to parse user metadata');
        }

        // Set waitForApproval to false (user doesn't need to wait anymore)
        mt.waitForApproval = false;

        // Update and broadcast user metadata
        try {
            await this.natsUserService.updateAndBroadcastUserMetadata(roomId, userId, mt, null);
        } catch (error) {
            throw new Error('Failed to approve user. Please try again.');
        }
    }

    /**
     * updateWaitingRoomMessage updates the waiting room message for a room
     * 
     * @param req - Request containing roomId and new message
     */
    async updateWaitingRoomMessage(req: UpdateWaitingRoomMessageReq): Promise<void> {
        const log = this.logger;
        log.log(`Updating waiting room message for room ${req.roomId}`);

        // Get room metadata
        const roomMeta = await this.natsRoomService.getRoomMetadataStruct(req.roomId);
        if (!roomMeta) {
            throw new Error('invalid or missing room metadata information');
        }

        // Update waiting room message
        if (!roomMeta.roomFeatures?.waitingRoomFeatures) {
            throw new Error('waiting room features not configured');
        }

        roomMeta.roomFeatures.waitingRoomFeatures.waitingRoomMsg = req.msg;

        // Update and broadcast room metadata
        await this.natsRoomEventsService.updateAndBroadcastRoomMetadata(req.roomId, roomMeta);

        log.log('Successfully updated waiting room message');
    }
}
