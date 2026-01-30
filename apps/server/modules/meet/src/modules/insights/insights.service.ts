/**
 * Insights Service
 *
 * Coordinator for AI-powered features
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { toBinary, create } from '@bufbuild/protobuf';
import {
    InsightsTranscriptionConfigReq,
    InsightsTranscriptionUserSessionReq,
    InsightsChatTranslationConfigReq,
    InsightsTranslateTextReq,
    InsightsAITextChatConfigReq,
    InsightsAITextChatContent,
    InsightsAIMeetingSummarizationConfigReq,
    CommonResponse,
    InsightsSupportedLangInfo,
    CommonResponseSchema,
    InsightsTranscriptionConfigReqSchema,
    InsightsTranscriptionUserSessionReqSchema,
    InsightsChatTranslationConfigReqSchema,
    InsightsTranslateTextReqSchema,
    InsightsAITextChatConfigReqSchema,
    InsightsAITextChatContentSchema,
    InsightsAIMeetingSummarizationConfigReqSchema,
    InsightsUserSessionAction,
} from '@workspace/protocol';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { RedisInsightsService } from '../../infrastructure/redis/redis-insights.service';
import { InsightsTaskPayload, InsightsServiceType, InsightsTaskType, AgentTaskResponse } from './insights.types';

@Injectable()
export class InsightsService {
    private readonly logger = new Logger(InsightsService.name);

    constructor(
        private readonly configService: ConfigService,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
        private readonly natsRoomService: NatsRoomService,
        private readonly redisInsightsService: RedisInsightsService,
    ) { }

    /**
     * TranscriptionConfigure configures the real-time transcription agent
     */
    async transcriptionConfigure(roomId: string, r: InsightsTranscriptionConfigReq): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (!metadata) throw new Error('invalid room metadata');

        const insightsFeatures = metadata.roomFeatures?.insightsFeatures;
        if (!insightsFeatures?.isAllow) {
            throw new Error("insights feature isn't allowed for this room");
        }
        if (!insightsFeatures.transcriptionFeatures?.isAllow) {
            throw new Error("transcription feature isn't allowed for this room");
        }

        // Disable legacy Azure STT if enabled
        if (metadata.roomFeatures?.speechToTextTranslationFeatures?.isEnabled) {
            metadata.roomFeatures.speechToTextTranslationFeatures.isEnabled = false;
        }

        const roomInfo = await this.natsRoomService.getRoomInfo(roomId);

        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.ConfigureAgent,
            service_type: InsightsServiceType.Transcription,
            room_id: roomId,
            room_table_id: roomInfo ? parseInt(roomInfo.dbTableId, 10) : 0,
            options: toBinary(InsightsTranscriptionConfigReqSchema, r),
            enabled_transcription_trans_synthesis: r.isEnabledSpeechSynthesis,
            allowed_trans_langs: insightsFeatures.transcriptionFeatures.allowedTransLangs,
        };

        if (metadata.roomFeatures?.endToEndEncryptionFeatures?.isEnabled) {
            payload.room_e2ee_key = metadata.roomFeatures.endToEndEncryptionFeatures.encryptionKey;
        }

        await this.configureAgent(payload);

        // Update metadata
        const transFeatures = insightsFeatures.transcriptionFeatures;
        transFeatures.isEnabled = true;
        transFeatures.allowedTransLangs = r.allowedTransLangs;
        // transcriptionProvider is not in proto yet, skip or use extraData
        transFeatures.maxSelectedTransLangs = this.configService.get<number>('INSIGHTS_MAX_TRANSCRIPTION_LANGS', 2);

        await this.natsRoomService.updateRoomMetadata(roomId, metadata);

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * TranscriptionUserSession starts/ends personal transcription for a user
     */
    async transcriptionUserSession(roomId: string, userId: string, r: InsightsTranscriptionUserSessionReq): Promise<CommonResponse> {
        const roomInfo = await this.natsRoomService.getRoomInfo(roomId);

        const payload: InsightsTaskPayload = {
            task: r.action === InsightsUserSessionAction.USER_SESSION_ACTION_START ? InsightsTaskType.UserStart : InsightsTaskType.UserEnd,
            service_type: InsightsServiceType.Transcription,
            room_id: roomId,
            room_table_id: roomInfo ? parseInt(roomInfo.dbTableId, 10) : 0,
            user_id: userId,
            options: toBinary(InsightsTranscriptionUserSessionReqSchema, r),
        };

        await this.configureAgent(payload);
        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    async endTranscription(roomId: string): Promise<CommonResponse> {
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.EndRoomAgentByServiceName,
            service_type: InsightsServiceType.Transcription,
            room_id: roomId,
            room_table_id: 0,
        };

        await this.configureAgent(payload);

        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        const transFeatures = metadata?.roomFeatures?.insightsFeatures?.transcriptionFeatures;
        if (transFeatures) {
            transFeatures.isEnabled = false;
            await this.natsRoomService.updateRoomMetadata(roomId, metadata!);
        }

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * ChatTranslationConfigure configures chat translation
     */
    async chatTranslationConfigure(roomId: string, r: InsightsChatTranslationConfigReq): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        const chatTransFeatures = metadata?.roomFeatures?.insightsFeatures?.chatTranslationFeatures;
        if (!chatTransFeatures?.isAllow) {
            throw new Error("chat translation feature isn't allowed for this room");
        }

        const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.ConfigureAgent,
            service_type: InsightsServiceType.Translation,
            room_id: roomId,
            room_table_id: roomInfo ? parseInt(roomInfo.dbTableId, 10) : 0,
            options: toBinary(InsightsChatTranslationConfigReqSchema, r),
        };

        await this.configureAgent(payload);

        chatTransFeatures.isEnabled = true;
        chatTransFeatures.allowedTransLangs = r.allowedTransLangs;
        chatTransFeatures.maxSelectedTransLangs = this.configService.get<number>('INSIGHTS_MAX_CHAT_TRANS_LANGS', 5);

        await this.natsRoomService.updateRoomMetadata(roomId, metadata!);

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * ExecuteChatTranslation performs text translation
     */
    async executeChatTranslation(roomId: string, userId: string, r: InsightsTranslateTextReq): Promise<any> {
        const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.UserStart,
            service_type: InsightsServiceType.Translation,
            room_id: roomId,
            room_table_id: roomInfo ? parseInt(roomInfo.dbTableId, 10) : 0,
            user_id: userId,
            options: toBinary(InsightsTranslateTextReqSchema, r),
        };

        const res = await firstValueFrom(
            this.natsClient.send<any>('plug-n-meet-insights', payload)
        );

        if (res.status && res.result) {
            await this.redisInsightsService.incrementChatTranslationUsage(roomId, userId, r.text.length);
        }

        return res;
    }

    /**
     * AITextChatConfigure configures AI chat
     */
    async aiTextChatConfigure(roomId: string, r: InsightsAITextChatConfigReq): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        const aiFeatures = metadata?.roomFeatures?.insightsFeatures?.aiFeatures;
        if (!aiFeatures?.isAllow || !aiFeatures.aiTextChatFeatures?.isAllow) {
            throw new Error("AI text chat feature isn't allowed for this room");
        }

        const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.ConfigureAgent,
            service_type: InsightsServiceType.AITextChat,
            room_id: roomId,
            room_table_id: roomInfo ? parseInt(roomInfo.dbTableId, 10) : 0,
            options: toBinary(InsightsAITextChatConfigReqSchema, r),
        };

        await this.configureAgent(payload);

        aiFeatures.aiTextChatFeatures.isEnabled = true;
        await this.natsRoomService.updateRoomMetadata(roomId, metadata!);

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * ExecuteAITextChat sends a message to AI
     */
    async executeAITextChat(roomId: string, userId: string, r: InsightsAITextChatContent): Promise<CommonResponse> {
        const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.UserStart,
            service_type: InsightsServiceType.AITextChat,
            room_id: roomId,
            room_table_id: roomInfo ? parseInt(roomInfo.dbTableId, 10) : 0,
            user_id: userId,
            options: toBinary(InsightsAITextChatContentSchema, r),
        };

        return await firstValueFrom(
            this.natsClient.send<CommonResponse>('plug-n-meet-insights', payload)
        );
    }

    /**
     * MeetingSummarizationConfigure configures summarization
     */
    async meetingSummarizationConfigure(roomId: string, r: InsightsAIMeetingSummarizationConfigReq): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        const aiFeatures = metadata?.roomFeatures?.insightsFeatures?.aiFeatures;
        if (!aiFeatures?.isAllow || !aiFeatures.meetingSummarizationFeatures?.isAllow) {
            throw new Error("meeting summarization feature isn't allowed for this room");
        }

        const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.ConfigureAgent,
            service_type: InsightsServiceType.MeetingSummarizing,
            room_id: roomId,
            room_table_id: roomInfo ? parseInt(roomInfo.dbTableId, 10) : 0,
            options: toBinary(InsightsAIMeetingSummarizationConfigReqSchema, r),
        };

        await this.configureAgent(payload);

        aiFeatures.meetingSummarizationFeatures.isEnabled = true;
        await this.natsRoomService.updateRoomMetadata(roomId, metadata!);

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * configureAgent sends a NATS request to the agent coordinator channel
     */
    private async configureAgent(payload: InsightsTaskPayload): Promise<void> {
        try {
            const res = await firstValueFrom(
                this.natsClient.send<AgentTaskResponse>('plug-n-meet-insights', payload)
            );
            if (!res.status) {
                throw new Error(res.msg || 'agent failed to process task');
            }
        } catch (error) {
            this.logger.error(`Configure agent failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * GetSupportedLangs returns supported languages for a service
     */
    async getSupportedLangs(serviceType: string): Promise<InsightsSupportedLangInfo[]> {
        return [];
    }
}
