/**
 * Speech To Text Service
 *
 * Handles legacy Azure Speech Services token generation and usage
 */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import axios from 'axios';
import {
    GenerateAzureTokenReq,
    GenerateAzureTokenRes,
    GenerateAzureTokenResSchema,
    AzureTokenRenewReq,
    SpeechServiceUserStatusReq,
    SpeechToTextTranslationReq,
    CommonResponse,
    SpeechServiceUserStatusTasks,
    CommonResponseSchema,
    NatsMsgServerToClientEvents,
    AnalyticsEventType,
    AnalyticsEvents,
    AnalyticsDataMsgSchema,
    AnalyticsStatus,
} from '@workspace/protocol';
import { create, toJsonString } from '@bufbuild/protobuf';
import { NatsRoomService } from '@server/meet/handlers/nats-room.service';
import { RedisSpeechToTextService } from '@server/meet/infrastructure/redis/redis-speech-to-text.service';
import { NatsSystemEventsService } from '@server/meet/handlers/nats-system-events.service';
import { WebhookNotifierService } from '@server/meet/infrastructure/webhook/webhook-notifier.service';
import { AnalyticsService } from '@server/meet/modules/analytics/analytics.service';
import { AppConfigService } from '@server/shared';

@Injectable()
export class SpeechToTextService {
    private readonly logger = new Logger(SpeechToTextService.name);

    constructor(
        private readonly appConfig: AppConfigService,
        private readonly natsRoomService: NatsRoomService,
        private readonly redisSpeechService: RedisSpeechToTextService,
        private readonly natsSystemEvents: NatsSystemEventsService,
        @Inject(forwardRef(() => WebhookNotifierService))
        private readonly webhookNotifier: WebhookNotifierService,
        @Inject(forwardRef(() => AnalyticsService))
        private readonly analyticsModel: AnalyticsService,
    ) { }

    /**
     * SpeechToTextTranslationServiceStart enables/disables the service for a room
     */
    async speechToTextTranslationServiceStart(roomId: string, r: SpeechToTextTranslationReq): Promise<CommonResponse> {
        const azureEnabled = this.appConfig.azureSpeech.enabled;
        if (!azureEnabled) {
            throw new Error('speech service disabled');
        }

        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (!metadata) throw new Error('invalid room metadata');

        const f = metadata.roomFeatures?.speechToTextTranslationFeatures;
        if (!f) {
            throw new Error('speech to text features not found in metadata');
        }

        f.isEnabled = r.isEnabled;
        f.allowedSpeechLangs = r.allowedSpeechLangs;
        f.allowedSpeechUsers = r.allowedSpeechUsers;
        f.isEnabledTranslation = r.isEnabledTranslation;
        f.allowedTransLangs = r.allowedTransLangs;
        f.defaultSubtitleLang = r.defaultSubtitleLang;

        const updateMt = await this.natsRoomService.updateRoomMetadata(roomId, metadata);
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            roomId,
            updateMt,
        );


        // Analytics
        let val = AnalyticsStatus[AnalyticsStatus.STARTED];
        if (!f.isEnabled) {
            val = AnalyticsStatus[AnalyticsStatus.ENDED];
        }

        await this.analyticsModel.handleEvent(create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_SPEECH_SERVICE_STATUS,
            roomId: roomId,
            hsetValue: val,
        }));

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * GenerateAzureToken generates a token for a user
     */
    async generateAzureToken(roomId: string, userId: string, r: GenerateAzureTokenReq): Promise<CommonResponse> {
        const check = await this.redisSpeechService.azureKeyRequestedTask(roomId, userId, 'check');
        if (check === 'exist') {
            throw new Error('speech-services.already-received-token');
        }

        const usage = await this.redisSpeechService.checkUserUsage(roomId, userId);
        if (usage !== '') {
            throw new Error('speech-services.already-using-service');
        }

        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        const azureEnabled = this.appConfig.azureSpeech.enabled;
        if (!metadata || !azureEnabled || !metadata.roomFeatures?.speechToTextTranslationFeatures?.isEnabled) {
            throw new Error('speech-services.service-disabled');
        }

        const key = await this.selectAzureKey();
        const azureRes = await this.sendRequestToAzureForToken(key.subscriptionKey, key.serviceRegion, key.id);

        await this.redisSpeechService.azureKeyRequestedTask(roomId, userId, 'add');

        // Broadcast to user via NATS (System Event)
        await this.broadcastAzureToken(roomId, userId, azureRes);

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    async renewAzureToken(roomId: string, userId: string, r: AzureTokenRenewReq): Promise<CommonResponse> {
        const usage = await this.redisSpeechService.checkUserUsage(roomId, userId);
        if (usage === '') {
            throw new Error('speech-services.renew-need-already-using-service');
        }

        const azureKeys = this.appConfig.azureSpeech.subscriptionKeys;
        const key = azureKeys.find(k => k.id === r.keyId);
        if (!key) {
            throw new Error('speech-services.renew-subscription-key-not-found');
        }

        const azureRes = await this.sendRequestToAzureForToken(key.subscriptionKey, r.serviceRegion, r.keyId);
        azureRes.renew = true;

        await this.broadcastAzureToken(roomId, userId, azureRes);

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    async speechServiceUserStatus(roomId: string, userId: string, r: SpeechServiceUserStatusReq): Promise<CommonResponse> {
        await this.redisSpeechService.updateUserStatus(r.keyId, r.task);
        return this.speechServiceUsersUsage(roomId, r.roomSid, userId, r.task);
    }


    private async speechServiceUsersUsage(roomId: string, rSid: string, userId: string, task: SpeechServiceUserStatusTasks): Promise<CommonResponse> {
        switch (task) {
            case SpeechServiceUserStatusTasks.SPEECH_TO_TEXT_SESSION_STARTED:
                await this.redisSpeechService.usersUsage(roomId, userId, task);
                // Webhook
                await this.sendToWebhookNotifier(roomId, rSid, userId, task, 0);
                // Analytics
                await this.analyticsModel.handleEvent(create(AnalyticsDataMsgSchema, {
                    eventType: AnalyticsEventType.USER,
                    eventName: AnalyticsEvents.ANALYTICS_EVENT_USER_SPEECH_SERVICES_STATUS,
                    roomId: roomId,
                    userId: userId,
                    hsetValue: AnalyticsStatus[AnalyticsStatus.STARTED],
                }));
                break;
            case SpeechServiceUserStatusTasks.SPEECH_TO_TEXT_SESSION_ENDED:
                const usage = await this.redisSpeechService.usersUsage(roomId, userId, task);
                if (usage > 0) {
                    // Webhook
                    await this.sendToWebhookNotifier(roomId, rSid, userId, task, usage);
                    // Analytics Status
                    await this.analyticsModel.handleEvent(create(AnalyticsDataMsgSchema, {
                        eventType: AnalyticsEventType.USER,
                        eventName: AnalyticsEvents.ANALYTICS_EVENT_USER_SPEECH_SERVICES_STATUS,
                        roomId: roomId,
                        userId: userId,
                        hsetValue: AnalyticsStatus[AnalyticsStatus.ENDED],
                    }));
                    // Analytics Usage
                    await this.analyticsModel.handleEvent(create(AnalyticsDataMsgSchema, {
                        eventType: AnalyticsEventType.USER,
                        eventName: AnalyticsEvents.ANALYTICS_EVENT_USER_SPEECH_SERVICES_USAGE,
                        roomId: roomId,
                        userId: userId,
                        eventValueInteger: usage.toString(),
                    }));

                }
                break;
        }

        // Always remove from requested task list
        await this.redisSpeechService.azureKeyRequestedTask(roomId, userId, 'remove');
        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    private async selectAzureKey(): Promise<any> {
        const keys = this.appConfig.azureSpeech.subscriptionKeys;
        if (keys.length === 0) throw new Error('no azure keys found');
        if (keys.length === 1) return keys[0];

        const usableKeys: any[] = [];
        for (const k of keys) {
            const conns = await this.redisSpeechService.getConnectionsByKeyId(k.id);
            const count = parseInt(conns, 10) || 0;
            usableKeys.push({ ...k, currentConns: count, available: k.maxConnection - count });
        }

        usableKeys.sort((a, b) => b.available - a.available);
        if (usableKeys[0].available <= 0) throw new Error('no usable azure key found (limit reached)');

        return usableKeys[0];
    }

    private async sendRequestToAzureForToken(subscriptionKey: string, serviceRegion: string, keyId: string): Promise<GenerateAzureTokenRes> {
        const url = `https://${serviceRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
        try {
            const response = await axios.post(url, {}, {
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error(`Azure returned status ${response.status}`);
            }

            return create(GenerateAzureTokenResSchema, {
                status: true,
                msg: 'success',
                token: response.data,
                serviceRegion,
                keyId,
            });
        } catch (error) {
            this.logger.error(`Azure token request failed: ${error.message}`);
            throw error;
        }
    }

    private async broadcastAzureToken(roomId: string, userId: string, data: GenerateAzureTokenRes): Promise<void> {
        const jsonStr = toJsonString(GenerateAzureTokenResSchema, data);
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            (NatsMsgServerToClientEvents as any).AZURE_COGNITIVE_SERVICE_SPEECH_TOKEN,
            roomId,
            jsonStr,
            userId,
        );
    }

    /**
     * OnAfterRoomEnded performs cleanup when a room ends
     */
    async onAfterRoomEnded(roomId: string, sId: string): Promise<void> {
        if (!sId) return;

        // Give some time for final requests to arrive
        const waitTime = this.appConfig.timeouts.waitBeforeSpeechCleanup;
        await new Promise(resolve => setTimeout(resolve, waitTime));

        try {
            const hkeys = await this.redisSpeechService.getHashKeys(roomId);
            for (const k of hkeys) {
                if (k !== 'total_usage') {
                    // Send ENDED status for each user still tracked
                    await this.speechServiceUsersUsage(roomId, sId, k, SpeechServiceUserStatusTasks.SPEECH_TO_TEXT_SESSION_ENDED);
                }
            }

            // Get total usage
            const usageStr = await this.redisSpeechService.getTotalUsageByRoomId(roomId);
            if (usageStr && usageStr !== '0') {
                const usage = parseInt(usageStr, 10);
                // Send usage via webhook notifier
                await this.sendToWebhookNotifier(roomId, sId, null, SpeechServiceUserStatusTasks.SPEECH_TO_TEXT_TOTAL_USAGE, usage);

                // Send to analytics
                await this.analyticsModel.handleEvent(create(AnalyticsDataMsgSchema, {
                    eventType: AnalyticsEventType.ROOM,
                    eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_SPEECH_SERVICE_TOTAL_USAGE,
                    roomId: roomId,
                    eventValueString: usageStr,
                }));
            }

            // Final cleanup
            await this.redisSpeechService.deleteRoom(roomId);
        } catch (error) {
            this.logger.error(`Error in speech service cleanup for ${roomId}: ${error.message}`);
        }
    }

    private async sendToWebhookNotifier(rId: string, rSid: string, userId: string | null, task: SpeechServiceUserStatusTasks, usage: number): Promise<void> {
        const event = SpeechServiceUserStatusTasks[task] || task.toString();
        const msg = {
            event: event,
            room: {
                sid: rSid,
                roomId: rId,
            },
            speechService: {
                userId: userId || undefined,
                totalUsage: BigInt(usage).toString(),
            },
        };

        try {
            await this.webhookNotifier.sendWebhookEvent(msg as any);
        } catch (error) {
            this.logger.error(`Failed to send speech service webhook: ${error.message}`);
        }
    }
}
