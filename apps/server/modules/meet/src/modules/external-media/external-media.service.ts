import { Injectable, Logger } from '@nestjs/common';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { NatsService } from '../../interfaces/nats/nats.service';
import { AnalyticsService } from '../analytics/analytics.service';
import {
    ExternalMediaPlayerReq,
    ExternalMediaPlayerTask,
    DataMsgBodyType,
    NatsMsgServerToClientEvents,
    AnalyticsDataMsg,
    AnalyticsEventType,
    AnalyticsEvents,
    AnalyticsStatus,
    AnalyticsDataMsgSchema,
} from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';

@Injectable()
export class ExternalMediaService {
    private readonly logger = new Logger(ExternalMediaService.name);

    constructor(
        private readonly natsRoomService: NatsRoomService,
        private readonly natsUserService: NatsUserService,
        private readonly natsSystemEvents: NatsSystemEventsService,
        private readonly natsService: NatsService,
        private readonly analyticsService: AnalyticsService,
    ) { }

    /**
     * HandleRequest processes start/end/update external media requests
     */
    async handleRequest(req: ExternalMediaPlayerReq): Promise<void> {
        this.logger.log(`External media request for room ${req.roomId}, task: ${req.task}`);

        // 1. Validation
        const { info, metadata } = await this.natsRoomService.getRoomInfoWithMetadata(req.roomId);
        if (!info || !metadata) {
            throw new Error('Room not found');
        }

        const feature = metadata.roomFeatures?.externalMediaPlayerFeatures;
        if (!feature) {
            throw new Error('External media player feature not found in metadata');
        }

        // Check user
        const status = await this.natsUserService.getRoomUserStatus(req.roomId, req.userId);
        if (status !== 'online') {
            throw new Error('User not active');
        }

        // Check permission if not admin
        // Ideally should check isAdmin or isPresenter status from user metadata
        const userMeta = await this.natsUserService.getUserMetadataStruct(req.roomId, req.userId);
        if (!userMeta?.isAdmin && !userMeta?.isPresenter) {
            throw new Error('Permission denied');
        }

        // 2. Logic based on action
        let isActive = false;

        if (req.task === ExternalMediaPlayerTask.START_PLAYBACK) {
            if (!req.url || req.url.trim() === '') {
                throw new Error('valid url required');
            }
            if (feature.isActive) {
                // If already active, maybe just updating URL? 
            }
            isActive = true;
            feature.isActive = true;
            feature.url = req.url;
            feature.sharedBy = req.userId;
        } else if (req.task === ExternalMediaPlayerTask.END_PLAYBACK) {
            isActive = false;
            feature.isActive = false;
            feature.url = '';
        }

        // 3. Update NATS Metadata
        // We persist metadata changes if it's a state change (START/END)
        // If it's just a seek (START with same URL?), maybe we update anyway.
        // For simplicity, we update metadata on every request for now to ensure consistency.
        await this.natsRoomService.updateRoomMetadata(req.roomId, metadata);

        // Notify room about metadata update
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            req.roomId,
            this.natsService.marshalRoomMetadata(metadata)
        );

        // 4. Broadcast Event via Data Channel
        // Send the specific external media event to all clients
        const msg = JSON.stringify(req);

        await this.natsSystemEvents.broadcastDataChannelMessage(
            req.roomId,
            DataMsgBodyType.EXTERNAL_MEDIA_PLAYER_EVENTS,
            msg,
            req.userId
        );

        // 5. Send Analytics
        const val = isActive ? AnalyticsStatus.STARTED.toString() : AnalyticsStatus.ENDED.toString();
        const analyticsMsg = create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_EXTERNAL_MEDIA_PLAYER_STATUS,
            roomId: req.roomId,
            hsetValue: val,
        });
        await this.analyticsService.handleEvent(analyticsMsg);
    }
}
