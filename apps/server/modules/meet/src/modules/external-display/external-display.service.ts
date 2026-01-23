import { Injectable, Logger } from '@nestjs/common';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { NatsService } from '../../interfaces/nats/nats.service';
import { AnalyticsService } from '../analytics/analytics.service';
import {
    ExternalDisplayLinkReq,
    ExternalDisplayLinkTask,
    DataMsgBodyType,
    NatsMsgServerToClientEvents,
    AnalyticsDataMsg,
    AnalyticsEventType,
    AnalyticsEvents,
    AnalyticsStatus,
    ExternalDisplayLinkReqSchema,
    AnalyticsDataMsgSchema,
} from '@workspace/protocol';
import { create, toJsonString } from '@bufbuild/protobuf';

@Injectable()
export class ExternalDisplayService {
    private readonly logger = new Logger(ExternalDisplayService.name);

    constructor(
        private readonly natsRoomService: NatsRoomService,
        private readonly natsUserService: NatsUserService,
        private readonly natsSystemEvents: NatsSystemEventsService,
        private readonly natsService: NatsService,
        private readonly analyticsService: AnalyticsService,
    ) { }

    /**
     * HandleRequest processes start/stop external display requests
     */
    async handleRequest(req: ExternalDisplayLinkReq): Promise<void> {
        this.logger.log(`External display request for room ${req.roomId}, task: ${req.task}`);

        // 1. Validation
        const { info, metadata } = await this.natsRoomService.getRoomInfoWithMetadata(req.roomId);
        if (!info || !metadata) {
            throw new Error('Room not found');
        }

        const feature = metadata.roomFeatures?.displayExternalLinkFeatures;
        if (!feature || !feature.isAllow) {
            throw new Error('External display feature disabled');
        }

        // Check user
        const status = await this.natsUserService.getRoomUserStatus(req.roomId, req.userId);
        if (status !== 'online') {
            throw new Error('User not active');
        }

        // Check permission if not admin
        const userMeta = await this.natsUserService.getUserMetadataStruct(req.roomId, req.userId);
        if (!userMeta?.isAdmin && !userMeta?.isPresenter) {
            throw new Error('Permission denied');
        }

        // 2. Logic based on action
        let isActive = false;

        if (req.task === ExternalDisplayLinkTask.START_EXTERNAL_LINK) {
            if (!req.url) {
                throw new Error('Valid url required');
            }
            isActive = true;
            feature.isActive = true;
            feature.link = req.url;
            feature.sharedBy = req.userId;
        } else if (req.task === ExternalDisplayLinkTask.STOP_EXTERNAL_LINK) {
            isActive = false;
            feature.isActive = false;
            // Go code doesn't clear link or sharedBy on stop, only sets isActive=false
        } else {
            throw new Error('Invalid request task');
        }

        // 3. Update NATS Metadata
        await this.natsRoomService.updateRoomMetadata(req.roomId, metadata);

        // Notify room about metadata update
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            req.roomId,
            this.natsService.marshalRoomMetadata(metadata)
        );

        // 4. Broadcast Event via Data Channel
        // Send the specific external display event to all clients
        // Note: DataMsgBodyType.EXTERNAL_DISPLAY_LINK_EVENTS is missing in protocol definition
        // We will skip sending this for now.

        /*
        const msg = toJsonString(ExternalDisplayLinkReqSchema, req);
        await this.natsSystemEvents.broadcastDataChannelMessage(
            req.roomId,
            DataMsgBodyType.EXTERNAL_DISPLAY_LINK_EVENTS,
            msg,
            req.userId
        );
        */

        // 5. Send Analytics
        const val = isActive ? AnalyticsStatus.STARTED.toString() : AnalyticsStatus.ENDED.toString();
        const analyticsMsg = create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_EXTERNAL_DISPLAY_LINK_STATUS,
            roomId: req.roomId,
            hsetValue: val,
        });
        await this.analyticsService.handleEvent(analyticsMsg);
    }
}
