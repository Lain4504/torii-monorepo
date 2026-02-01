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
        await this.validateRequest(req);

        switch (req.task) {
            case ExternalDisplayLinkTask.START_EXTERNAL_LINK:
                await this.startExternalDisplay(req);
                break;
            case ExternalDisplayLinkTask.STOP_EXTERNAL_LINK:
                await this.endExternalDisplay(req);
                break;
            default:
                throw new Error('Not valid request');
        }
    }

    private async validateRequest(req: ExternalDisplayLinkReq): Promise<void> {
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
    }

    private async startExternalDisplay(req: ExternalDisplayLinkReq): Promise<void> {
        if (!req.url || req.url === '') {
            throw new Error('Valid url required');
        }

        const active = true;
        await this.updateExternalDisplayRoomMetadata(req.roomId, {
            isActive: active,
            url: req.url,
            sharedBy: req.userId,
        });
    }

    private async endExternalDisplay(req: ExternalDisplayLinkReq): Promise<void> {
        const active = false;
        await this.updateExternalDisplayRoomMetadata(req.roomId, {
            isActive: active,
        });
    }

    private async updateExternalDisplayRoomMetadata(
        roomId: string,
        opts: { isActive?: boolean; url?: string; sharedBy?: string },
    ): Promise<void> {
        this.logger.log(`Updating room metadata for external display: ${roomId}`);

        const { info, metadata } = await this.natsRoomService.getRoomInfoWithMetadata(roomId);
        if (!info || !metadata) {
            throw new Error('Room not found');
        }

        const feature = metadata.roomFeatures?.displayExternalLinkFeatures;
        if (!feature) {
            // Note: Go code checks feature.isAllow here implicitly via if check? 
            // NestJS existing code checked !feature || !feature.isAllow
            // Go code: invalid nil room metadata information error if roomMeta is nil.
            throw new Error('External display feature not found in metadata');
        }

        if (opts.isActive !== undefined) {
            feature.isActive = opts.isActive;
        }
        if (opts.url !== undefined) {
            feature.link = opts.url;
        }
        if (opts.sharedBy !== undefined) {
            feature.sharedBy = opts.sharedBy;
        }

        await this.natsRoomService.updateRoomMetadata(roomId, metadata);

        // Notify room about metadata update
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            roomId,
            this.natsService.marshalRoomMetadata(metadata)
        );

        // Send Analytics
        const val = feature.isActive ? AnalyticsStatus.STARTED.toString() : AnalyticsStatus.ENDED.toString();
        const analyticsMsg = create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_EXTERNAL_DISPLAY_LINK_STATUS,
            roomId: roomId,
            hsetValue: val,
        });
        await this.analyticsService.handleEvent(analyticsMsg);
    }
}
