import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import {
    CreateEtherpadSessionRes,
    CreateEtherpadSessionResSchema,
    CleanEtherpadReq,
    ChangeEtherpadStatusReq,
    NatsMsgServerToClientEvents,
    RoomMetadataSchema,
    SharedNotePadFeaturesSchema,
    RoomMetadata
} from '@workspace/protocol';
import { create, toJsonString } from '@bufbuild/protobuf';
import axios from 'axios';
import { NatsService } from '../../interfaces/nats/nats.service';

@Injectable()
export class EtherpadService {
    private readonly logger = new Logger(EtherpadService.name);
    private readonly etherpadHost: string;
    private readonly etherpadApiKey: string;
    private readonly etherpadClientId: string;
    private readonly etherpadClientSecret: string;
    private readonly nodeId: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly natsRoomService: NatsRoomService,
        private readonly natsUserService: NatsUserService,
        private readonly natsSystemEvents: NatsSystemEventsService,
        private readonly natsService: NatsService,
    ) {
        this.etherpadHost = this.configService.get<string>('ETHERPAD_HOST') || '';
        this.etherpadApiKey = this.configService.get<string>('ETHERPAD_API_KEY') || '';
        // Required for scaling/load balancing multiple etherpad nodes
        this.nodeId = this.configService.get<string>('ETHERPAD_NODE_ID') || 'node_1';

        // OAuth2 support
        this.etherpadClientId = this.configService.get<string>('ETHERPAD_CLIENT_ID') || '';
        this.etherpadClientSecret = this.configService.get<string>('ETHERPAD_CLIENT_SECRET') || '';
    }

    /**
     * CreateSession validates request and proxies to Etherpad
     */
    async createSession(roomId: string, userId: string): Promise<CreateEtherpadSessionRes> {
        // 1. Check if feature enabled in room metadata
        const { info, metadata } = await this.natsRoomService.getRoomInfoWithMetadata(roomId);
        if (!info || !metadata) {
            throw new Error('Room not found');
        }

        // Check recording
        let isRecording = false;
        if (info.metadata) {
            try {
                const meta = this.natsService.unmarshalRoomMetadata(info.metadata);
                if (meta.roomFeatures?.recordingFeatures?.isAllow) {
                    // Logic: if recording allows AND is currently active? 
                    // Actually original code checks `activeRoom.IsRecording`.
                    // The `isRecording` field in Metadata (Gen 0) is boolean.
                    if (meta.isRecording) {
                        isRecording = true;
                    }
                }
            } catch (e) {
                this.logger.warn(`Failed to unmarshal room metadata: ${e.message}`);
            }
        }

        if (isRecording) {
            throw new Error('Cannot create session while recording');
        }

        const sharedNoteInfo = metadata.roomFeatures?.sharedNotePadFeatures;
        if (!sharedNoteInfo || !sharedNoteInfo.allowedSharedNotePad) {
            throw new Error('Shared notepad feature is disabled');
        }

        // 2. Validate User Permission
        // Check if user is active
        const status = await this.natsUserService.getRoomUserStatus(roomId, userId);
        if (status !== 'online') {
            throw new Error('User is not active in this room');
        }

        // Check if user is blocked or has permission? 

        // 3. Mark room as active in NATS KV for this Etherpad node
        // This is important for cleanup/counting
        await this.natsRoomService.addRoomInEtherpad(this.nodeId, roomId);

        // 4. Construct Etherpad URL / Session
        // If OAuth2 enabled, get token first
        // Simple direct proxy or redirect URL logic:

        let finalUrl = '';
        if (this.etherpadHost) {
            // Basic Etherpad URL construction
            // Usually: http://host/p/<padID>?userName=<name>

            // Pad ID is typically the Room ID
            const padId = roomId;

            // Get user info for name
            const userInfo = await this.natsUserService.getUser(roomId, userId);
            const userName = userInfo?.name || 'Guest';

            finalUrl = `${this.etherpadHost}/p/${padId}?userName=${encodeURIComponent(userName)}`;

            // If we need to create the pad via API first to ensure it exists or set group, do it here.
            // It calls `createPad` if not exists usually, but current requirement implies simple URL for embedding?
            // `CreateSession` actually requests a session from Etherpad API if utilizing the "Group" feature,
            // OR simply returns the pad URL.

            // Let's assume simple Pad URL for now unless 'ETHERPAD_API_KEY' implies strictly API usage.
            this.logger.log(`Generated Etherpad URL for room ${roomId}: ${finalUrl}`);
        } else {
            throw new Error('Etherpad host not configured');
        }

        // 5. Broadcast system event that Etherpad is active? 
        // The client usually just asks for the URL and opens it in IFrame.
        // NATS notification is usually when *status* changes (e.g. disabled).

        const res = create(CreateEtherpadSessionResSchema, {
            status: true,
            msg: 'success',
            padId: roomId,
            readonlyPadId: roomId, // Assuming same for public
            // url is NOT a field in CreateEtherpadSessionRes
        });

        return res;
    }

    /**
     * CleanAfterRoomEnd handles cleanup when room ends
     */
    async cleanAfterRoomEnd(req: CleanEtherpadReq, metadataStr?: string): Promise<void> {
        const roomId = req.roomId;
        this.logger.log(`Cleaning etherpad session for room ${roomId}`);

        let metadata;
        if (metadataStr) {
            try {
                metadata = this.natsService.unmarshalRoomMetadata(metadataStr);
            } catch (e) {
                this.logger.warn(`Could not unmarshal provided room metadata for ${roomId}: ${e.message}`);
            }
        }

        if (!metadata) {
            // Get room metadata to extract etherpad info
            const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
            if (!roomInfo || !roomInfo.metadata) {
                this.logger.warn(`No metadata found for room ${roomId}, skipping etherpad cleanup`);
                return;
            }

            try {
                metadata = this.natsService.unmarshalRoomMetadata(roomInfo.metadata);
            } catch (e) {
                this.logger.warn(`Could not unmarshal room metadata for ${roomId}: ${e.message}`);
                return;
            }
        }

        const sharedNotePadFeatures = metadata.roomFeatures?.sharedNotePadFeatures;
        if (!sharedNotePadFeatures || !sharedNotePadFeatures.isAllow) {
            this.logger.debug(`Etherpad not enabled for room ${roomId}`);
            return;
        }

        const nodeId = sharedNotePadFeatures.nodeId || this.nodeId;
        const padId = sharedNotePadFeatures.notePadId || roomId;

        if (!nodeId || !padId) {
            this.logger.warn(`Missing nodeId or padId for room ${roomId}`);
            return;
        }

        // Remove from NATS KV
        await this.natsRoomService.removeRoomFromEtherpad(nodeId, roomId);

        // Call Etherpad API to delete pad if configured
        if (this.etherpadApiKey && this.etherpadHost) {
            try {
                const apiEndpoint = `${this.etherpadHost}/api/1.2.13/deletePad`;
                await axios.post(apiEndpoint, {
                    apikey: this.etherpadApiKey,
                    padID: padId
                });
                this.logger.log(`Successfully deleted pad ${padId} from Etherpad`);
            } catch (e) {
                this.logger.warn(`Failed to delete pad ${padId}: ${e.message}`);
            }
        }
    }

    /**
     * ChangeStatus enables/disables the feature dynamically
     */
    async changeStatus(req: ChangeEtherpadStatusReq): Promise<void> {
        // Update room metadata
        const { info, metadata } = await this.natsRoomService.getRoomInfoWithMetadata(req.roomId);
        if (!metadata || !metadata.roomFeatures) return;

        // Since sharedNotePadFeatures is optional, we must ensure it exists before assigning properties
        // Or re-create it. Protocol buffers objects are not always checking presence correctly if optional, 
        // but `create()` helps.
        // However, if we just want to update one field, we need to make sure the object exists.

        let feature = metadata.roomFeatures.sharedNotePadFeatures;
        if (!feature) {
            feature = create(SharedNotePadFeaturesSchema, {
                allowedSharedNotePad: false,
                isActive: req.isActive,
                visible: req.isActive,
                nodeId: this.nodeId,
                host: this.etherpadHost,
                notePadId: req.roomId, // Default?
                readOnlyPadId: req.roomId, // Default?
                isAllow: false,
            });
        } else {
            feature.isActive = req.isActive;
            feature.visible = req.isActive;
        }
        metadata.roomFeatures.sharedNotePadFeatures = feature;

        await this.natsRoomService.updateRoomMetadata(req.roomId, metadata);

        // Broadcast update
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            req.roomId,
            this.natsService.marshalRoomMetadata(metadata)
        );
    }
}
