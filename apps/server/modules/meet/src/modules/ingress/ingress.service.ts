/**
 * Ingress Service
 *
 * Handles creation of LiveKit Ingress (RTMP/WHIP) sessions
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create } from '@bufbuild/protobuf';
import {
    CreateIngressReq,
    CommonResponse,
    CreateIngressRes,
    CommonResponseSchema,
    CreateIngressResSchema,
    IngressInput as WajlcIngressInput,
    UserMetadata,
    UserMetadataSchema,
    AnalyticsDataMsgSchema,
    AnalyticsEventType,
    AnalyticsEvents,
    LockSettingsSchema,
    NatsMsgServerToClientEvents,
} from '@workspace/protocol';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { AnalyticsService } from '../analytics/analytics.service';

import { IngressInput } from 'livekit-server-sdk';

@Injectable()
export class IngressService {
    private readonly logger = new Logger(IngressService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly livekitService: LiveKitService,
        private readonly natsRoomService: NatsRoomService,
        private readonly natsUserService: NatsUserService,
        private readonly natsSystemEvents: NatsSystemEventsService,
        private readonly analyticsService: AnalyticsService,
    ) { }


    /**
     * CreateIngress creates a new LiveKit ingress session
     */
    async createIngress(req: CreateIngressReq): Promise<CreateIngressRes> {
        this.logger.log(`Request to create ingress: roomId=${req.roomId}, inputType=${WajlcIngressInput[req.inputType]}`);

        // 1. Get room metadata
        const metadata = await this.natsRoomService.getRoomMetadataStruct(req.roomId);
        if (!metadata) {
            throw new Error('invalid nil room metadata information');
        }

        const ingressFeatures = metadata.roomFeatures?.ingressFeatures;
        if (!ingressFeatures?.isAllow) {
            throw new Error("ingress feature isn't allowed for this room");
        }
        if (ingressFeatures.streamKey && ingressFeatures.streamKey !== '') {
            throw new Error('multiple ingress creation request not allowed');
        }

        // 2. Map input type
        let inputType = IngressInput.RTMP_INPUT;
        if (req.inputType === WajlcIngressInput.WHIP_INPUT) {
            inputType = IngressInput.WHIP_INPUT;
        }

        // 3. Prepare Livekit Ingress options
        const ingressUserIdPrefix = this.configService.get<string>('INGRESS_USER_ID_PREFIX', 'ingress_');
        const participantIdentity = `${ingressUserIdPrefix}${Date.now()}`;

        const options = {
            name: `${req.roomId}:1`,
            roomName: req.roomId,
            participantIdentity: participantIdentity,
            participantName: req.participantName,
        };

        this.logger.log(`Creating ingress with livekit: identity=${participantIdentity}`);

        // 4. Create Ingress via LiveKit client
        const lkIngressInfo = await this.livekitService.createIngress(inputType, options);
        if (!lkIngressInfo) {
            throw new Error('livekit returned invalid nil create ingress response');
        }

        // 5. Add ingress user to NATS (bot user)
        this.logger.log('Adding ingress participant to NATS user bucket');
        const userMetadata = create(UserMetadataSchema, {
            isAdmin: true,
            recordWebcam: true,
            waitForApproval: false,
            lockSettings: create(LockSettingsSchema, {
                lockWebcam: false,
                lockMicrophone: false,
            }),
        });

        await this.natsUserService.addUser(
            req.roomId,
            participantIdentity,
            req.participantName,
            true, // isAdmin
            false, // isPresenter (usually ingress bot is not a presenter)
            userMetadata
        );

        // 6. Update room metadata with ingress info
        ingressFeatures.inputType = req.inputType;
        ingressFeatures.url = lkIngressInfo.url;
        ingressFeatures.streamKey = lkIngressInfo.streamKey;

        this.logger.log('Updating and broadcasting room metadata with ingress info');
        const updateMt = await this.natsRoomService.updateRoomMetadata(req.roomId, metadata);
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            req.roomId,
            updateMt,
        );


        // 7. Send analytics
        await this.analyticsService.handleEvent(
            create(AnalyticsDataMsgSchema, {
                eventType: AnalyticsEventType.ROOM,
                eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_INGRESS_CREATED,
                roomId: req.roomId,
            })
        );

        this.logger.log('Successfully created ingress');

        return create(CreateIngressResSchema, {
            status: true,
            msg: 'success',
            url: lkIngressInfo.url,
            streamKey: lkIngressInfo.streamKey,
        });
    }
}
