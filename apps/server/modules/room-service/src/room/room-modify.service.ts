/**
 * Room Modify Service
 * Equivalent to Go: plugNmeet-server/pkg/models/room_modify.go
 * 
 * Handles room modification operations:
 * - Change visibility (whiteboard, notepad)
 */

import { Injectable, Logger } from '@nestjs/common';
import type { ChangeVisibilityRes } from '@workspace/protocol';
import { NatsRoomService } from '../nats/nats-room.service';
import { NatsRoomEventsService } from '../nats/nats-room-events.service';

/**
 * RoomModifyService handles room modification operations
 * Equivalent to Go: RoomModel methods in room_modify.go
 */
@Injectable()
export class RoomModifyService {
    private readonly logger = new Logger(RoomModifyService.name);

    constructor(
        private readonly natsRoomService: NatsRoomService,
        private readonly natsRoomEvents: NatsRoomEventsService,
    ) { }

    /**
     * ChangeVisibility updates visibility of whiteboard and/or notepad
     * Equivalent to Go: m.ChangeVisibility
     * 
     * @param req - ChangeVisibilityRes request
     * @returns { status: boolean, msg: string }
     */
    async changeVisibility(req: ChangeVisibilityRes): Promise<{ status: boolean; msg: string }> {
        this.logger.log(`ChangeVisibility for room: ${req.roomId}`);

        // Step 1: Get room metadata from NATS
        // Equivalent to Go: m.natsService.GetRoomMetadataStruct(r.RoomId)
        const roomMeta = await this.natsRoomService.getRoomMetadataStruct(req.roomId);

        if (!roomMeta) {
            return { status: false, msg: 'invalid nil room metadata information' };
        }

        // Step 2: Update visibility flags if provided
        // Equivalent to Go: if r.VisibleWhiteBoard != nil { ... }
        if (req.visibleWhiteBoard !== undefined && roomMeta.roomFeatures?.whiteboardFeatures) {
            roomMeta.roomFeatures.whiteboardFeatures.visible = req.visibleWhiteBoard;
            this.logger.log(`Updated whiteboard visibility: ${req.visibleWhiteBoard}`);
        }

        if (req.visibleNotepad !== undefined && roomMeta.roomFeatures?.sharedNotePadFeatures) {
            roomMeta.roomFeatures.sharedNotePadFeatures.visible = req.visibleNotepad;
            this.logger.log(`Updated notepad visibility: ${req.visibleNotepad}`);
        }

        // Step 3: Update and broadcast metadata
        // Equivalent to Go: m.natsService.UpdateAndBroadcastRoomMetadata(r.RoomId, roomMeta)
        try {
            await this.natsRoomEvents.updateAndBroadcastRoomMetadata(req.roomId, roomMeta);

            this.logger.log(`Visibility updated and broadcasted successfully for room: ${req.roomId}`);
            return { status: true, msg: 'success' };
        } catch (error) {
            this.logger.error(`Error updating visibility: ${error.message}`);
            return { status: false, msg: error instanceof Error ? error.message : 'Error updating visibility' };
        }
    }
}

