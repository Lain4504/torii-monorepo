/**
 * Speech To Text Service
 *
 * Handles legacy Azure Speech Services token generation and usage
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
} from '@workspace/protocol';
import { create, toJsonString } from '@bufbuild/protobuf';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { RedisSpeechToTextService } from '../../infrastructure/redis/redis-speech-to-text.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';

@Injectable()
export class SpeechToTextService {
    private readonly logger = new Logger(SpeechToTextService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly natsRoomService: NatsRoomService,
        private readonly redisSpeechService: RedisSpeechToTextService,
        private readonly natsSystemEvents: NatsSystemEventsService,
    ) { }

    /**
     * SpeechToTextTranslationServiceStart enables/disables the service for a room
     * Logic matches pkg/models/speechtotext_start.go
     */
    async speechToTextTranslationServiceStart(roomId: string, r: SpeechToTextTranslationReq): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (!metadata) throw new Error('invalid room metadata');

        const azureEnabled = this.configService.get<boolean>('AZURE_SPEECH_ENABLED', false);
        if (!azureEnabled) {
            throw new Error('speech-services.service-disabled');
        }

        if (metadata.roomFeatures?.speechToTextTranslationFeatures) {
            metadata.roomFeatures.speechToTextTranslationFeatures.isEnabled = r.isEnabled;
            await this.natsRoomService.updateRoomMetadata(roomId, metadata);
        }

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * GenerateAzureToken generates a token for a user
     * Logic matches pkg/models/speechtotext_token.go
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
        if (!metadata || !metadata.roomFeatures?.speechToTextTranslationFeatures?.isEnabled) {
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

        const azureKeys = this.getAzureSubscriptionKeys();
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
        const keyId = r.keyId;
        await this.redisSpeechService.updateUserStatus(keyId, r.task);
        await this.redisSpeechService.usersUsage(roomId, userId, r.task);

        if (r.task === SpeechServiceUserStatusTasks.SPEECH_TO_TEXT_SESSION_ENDED) {
            await this.redisSpeechService.azureKeyRequestedTask(roomId, userId, 'remove');
        }

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    private async selectAzureKey(): Promise<any> {
        const keys = this.getAzureSubscriptionKeys();
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

    private getAzureSubscriptionKeys(): any[] {
        const keysStr = this.configService.get<string>('AZURE_SPEECH_SUBSCRIPTION_KEYS', '[]');
        try {
            return JSON.parse(keysStr);
        } catch (e) {
            this.logger.error('Failed to parse AZURE_SPEECH_SUBSCRIPTION_KEYS');
            return [];
        }
    }

    private async broadcastAzureToken(roomId: string, userId: string, data: GenerateAzureTokenRes): Promise<void> {
        const jsonStr = toJsonString(GenerateAzureTokenResSchema, data);
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.AZURE_COGNITIVE_SERVICE_SPEECH_TOKEN,
            roomId,
            jsonStr,
            userId,
        );
    }
}
