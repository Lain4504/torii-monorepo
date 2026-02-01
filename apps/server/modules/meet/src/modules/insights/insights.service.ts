/**
 * Insights Service
 *
 * Coordinator for AI-powered features
 */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom, defaultIfEmpty } from 'rxjs';
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
    InsightsSupportedLangInfoSchema,
    CommonResponseSchema,
    InsightsTranscriptionConfigReqSchema,
    InsightsTranscriptionUserSessionReqSchema,
    InsightsChatTranslationConfigReqSchema,
    InsightsTranslateTextReqSchema,
    InsightsAITextChatConfigReqSchema,
    InsightsAITextChatContentSchema,
    InsightsAIMeetingSummarizationConfigReqSchema,
    InsightsUserSessionAction,
    AnalyticsEventType,
    AnalyticsEvents,
    AnalyticsDataMsgSchema,
    NatsSystemNotificationTypes,
    NatsMsgServerToClientEvents,
} from '@workspace/protocol';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { RedisInsightsService } from '../../infrastructure/redis/redis-insights.service';
import { ArtifactsService } from '../artifacts/artifacts.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { InsightsTaskPayload, InsightsServiceType, InsightsTaskType, AgentTaskResponse } from './insights.types';

@Injectable()
export class InsightsService {
    private readonly logger = new Logger(InsightsService.name);

    constructor(
        private readonly configService: ConfigService,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
        private readonly natsRoomService: NatsRoomService,
        private readonly natsUserService: NatsUserService,
        @Inject(forwardRef(() => NatsSystemEventsService))
        private readonly natsSystemEvents: NatsSystemEventsService,
        private readonly redisInsightsService: RedisInsightsService,
        private readonly artifactsService: ArtifactsService,
        @Inject(forwardRef(() => AnalyticsService))
        private readonly analyticsService: AnalyticsService,
    ) { }

    /**
     * TranscriptionConfigure configures the real-time transcription agent
     */
    async transcriptionConfigure(roomId: string, r: InsightsTranscriptionConfigReq): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (!metadata) throw new Error('invalid room metadata');

        // Check E2EE
        if (metadata.roomFeatures?.endToEndEncryptionFeatures?.enabledSelfInsertEncryptionKey) {
            throw new Error('insights.feature-disable-while-e2ee-self-key-enabled');
        }

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
        const usersMap: Record<string, boolean> = {};
        for (const user of r.allowedSpeechUsers) {
            usersMap[user] = true;
        }

        // First: Update metadata
        const transFeatures = insightsFeatures.transcriptionFeatures;
        transFeatures.isEnabled = true;
        transFeatures.allowedSpokenLangs = r.allowedSpokenLangs;
        transFeatures.allowedSpeechUsers = r.allowedSpeechUsers;
        transFeatures.defaultSubtitleLang = r.defaultSubtitleLang;

        if (transFeatures.isAllowTranslation) {
            transFeatures.isEnabledTranslation = r.isEnabledTranslation;
            transFeatures.allowedTransLangs = r.allowedTransLangs;
        }
        if (transFeatures.isAllowSpeechSynthesis) {
            transFeatures.isEnabledSpeechSynthesis = r.isEnabledSpeechSynthesis;
        }

        // Second: Prepare payload for agent
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.ConfigureAgent,
            service_type: InsightsServiceType.Transcription,
            room_id: roomId,
            room_table_id: roomInfo ? Number(roomInfo.dbTableId) : 0,
            enabled_transcription_trans_synthesis: r.isEnabledSpeechSynthesis,
            allowed_trans_langs: transFeatures.allowedTransLangs,
            target_users: usersMap,
            hidden_agent: true,
        };

        if (metadata.roomFeatures?.endToEndEncryptionFeatures?.isEnabled) {
            payload.room_e2ee_key = metadata.roomFeatures.endToEndEncryptionFeatures.encryptionKey;
        }

        // Third: Configure agent
        await this.configureAgent(payload);





        const updateMt = await this.natsRoomService.updateRoomMetadata(roomId, metadata);
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            roomId,
            updateMt,
        );

        // Analytics
        await this.analyticsService.handleEvent(create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_INSIGHTS_TRANSCRIPTION_STATUS,
            roomId: roomId,
            hsetValue: 'started',
        }));

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * TranscriptionUserSession starts/ends personal transcription for a user
     */
    async transcriptionUserSession(roomId: string, userId: string, r: InsightsTranscriptionUserSessionReq): Promise<CommonResponse> {
        if (r.action === InsightsUserSessionAction.USER_SESSION_ACTION_START) {
            if (!r.spokenLang || r.spokenLang === '') {
                throw new Error('spoken lang is required');
            }

            const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
            if (!metadata) throw new Error('invalid room metadata');

            if (metadata.roomFeatures?.endToEndEncryptionFeatures?.enabledSelfInsertEncryptionKey) {
                throw new Error('insights.feature-disable-while-e2ee-self-key-enabled');
            }

            const userInfo = await this.natsUserService.getUser(roomId, userId);
            if (!userInfo) {
                throw new Error('empty user info');
            }

            const options = {
                spokenLang: r.spokenLang,
                userName: userInfo.name,
                allowedTranscriptionStorage: r.allowedTranscriptionStorage,
            } as any;

            if (metadata.roomFeatures?.insightsFeatures?.transcriptionFeatures?.isEnabledTranslation) {
                options.transLangs = metadata.roomFeatures.insightsFeatures.transcriptionFeatures.allowedTransLangs;
            }


            const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
            const payload: InsightsTaskPayload = {
                task: InsightsTaskType.UserStart,
                service_type: InsightsServiceType.Transcription,
                room_id: roomId,
                room_table_id: roomInfo ? Number(roomInfo.dbTableId) : 0,
                user_id: userId,
                options: new TextEncoder().encode(JSON.stringify(options)),
            };

            await this.configureAgent(payload);
            return create(CommonResponseSchema, { status: true, msg: 'success' });

        } else if (r.action === InsightsUserSessionAction.USER_SESSION_ACTION_STOP) {
            const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
            const payload: InsightsTaskPayload = {
                task: InsightsTaskType.UserEnd,
                service_type: InsightsServiceType.Transcription,
                room_id: roomId,
                room_table_id: roomInfo ? Number(roomInfo.dbTableId) : 0,
                user_id: userId,
            };

            await this.configureAgent(payload);
            return create(CommonResponseSchema, { status: true, msg: 'success' });
        }

        throw new Error('unknown action');
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
        if (metadata && metadata.roomFeatures?.insightsFeatures?.transcriptionFeatures) {
            const transFeatures = metadata.roomFeatures.insightsFeatures.transcriptionFeatures;
            transFeatures.isEnabled = false;
            transFeatures.isEnabledTranslation = false;
            transFeatures.isEnabledSpeechSynthesis = false;
            const updateMt = await this.natsRoomService.updateRoomMetadata(roomId, metadata);
            await this.natsSystemEvents.broadcastSystemEventToRoom(
                NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
                roomId,
                updateMt,
            );
        }

        // Analytics
        await this.analyticsService.handleEvent(create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_INSIGHTS_TRANSCRIPTION_STATUS,
            roomId: roomId,
            hsetValue: 'ended',
        }));

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * ChatTranslationConfigure configures chat translation
     */
    async chatTranslationConfigure(roomId: string, r: InsightsChatTranslationConfigReq): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (!metadata) throw new Error('invalid room metadata');

        const chatTransFeatures = metadata.roomFeatures?.insightsFeatures?.chatTranslationFeatures;
        if (!chatTransFeatures?.isAllow) {
            throw new Error("chat translation feature isn't allowed for this room");
        }

        if (r.allowedTransLangs.length > chatTransFeatures.maxSelectedTransLangs) {
            throw new Error("max allowed selected languages exceeded");
        }

        chatTransFeatures.isEnabled = true;
        chatTransFeatures.allowedTransLangs = r.allowedTransLangs;
        chatTransFeatures.maxSelectedTransLangs = this.configService.get<number>('INSIGHTS_MAX_CHAT_TRANS_LANGS', 5);

        const updateMt = await this.natsRoomService.updateRoomMetadata(roomId, metadata!);
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            roomId,
            updateMt,
        );

        // Analytics
        await this.analyticsService.handleEvent(create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_INSIGHTS_CHAT_TRANSLATION_STATUS,
            roomId: roomId,
            hsetValue: 'started',
        }));

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    async chatEndTranslation(roomId: string): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (metadata && metadata.roomFeatures?.insightsFeatures?.chatTranslationFeatures) {
            metadata.roomFeatures.insightsFeatures.chatTranslationFeatures.isEnabled = false;
            const updateMt = await this.natsRoomService.updateRoomMetadata(roomId, metadata);
            await this.natsSystemEvents.broadcastSystemEventToRoom(
                NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
                roomId,
                updateMt,
            );
        }

        // Analytics
        await this.analyticsService.handleEvent(create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_INSIGHTS_CHAT_TRANSLATION_STATUS,
            roomId: roomId,
            hsetValue: 'ended',
        }));

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    /**
     * ExecuteChatTranslation performs text translation
     */
    async executeChatTranslation(roomId: string, userId: string, r: InsightsTranslateTextReq): Promise<any> {
        const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
        const opts = {
            text: r.text,
            source_lang: r.sourceLang,
            target_langs: r.targetLangs,
        };
        const options = new TextEncoder().encode(JSON.stringify(opts));

        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.UserStart,
            service_type: InsightsServiceType.Translation,
            room_id: roomId,
            room_table_id: roomInfo ? Number(roomInfo.dbTableId) : 0,
            user_id: userId,
            options: options,
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
        if (!metadata) throw new Error('invalid room metadata');

        const aiFeatures = metadata.roomFeatures?.insightsFeatures?.aiFeatures;
        if (!aiFeatures?.isAllow || !aiFeatures.aiTextChatFeatures?.isAllow) {
            throw new Error("AI text chat feature isn't allowed for this room");
        }

        aiFeatures.aiTextChatFeatures.isEnabled = true;
        aiFeatures.aiTextChatFeatures.isAllowedEveryone = r.isAllowedEveryone;
        aiFeatures.aiTextChatFeatures.allowedUserIds = r.allowedUserIds;

        const updateMt = await this.natsRoomService.updateRoomMetadata(roomId, metadata!);
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            roomId,
            updateMt,
        );

        // Analytics
        await this.analyticsService.handleEvent(create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_INSIGHTS_AI_TEXT_CHAT_STATUS,
            roomId: roomId,
            hsetValue: 'started',
        }));

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    async endAITextChat(roomId: string): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (metadata && metadata.roomFeatures?.insightsFeatures?.aiFeatures?.aiTextChatFeatures) {
            metadata.roomFeatures.insightsFeatures.aiFeatures.aiTextChatFeatures.isEnabled = false;
            const updateMt = await this.natsRoomService.updateRoomMetadata(roomId, metadata);
            await this.natsSystemEvents.broadcastSystemEventToRoom(
                NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
                roomId,
                updateMt,
            );
        }

        // Analytics
        await this.analyticsService.handleEvent(create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_INSIGHTS_AI_TEXT_CHAT_STATUS,
            roomId: roomId,
            hsetValue: 'ended',
        }));

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
            room_table_id: roomInfo ? Number(roomInfo.dbTableId) : 0,
            user_id: userId,
            options: new TextEncoder().encode(r.text),
        };


        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (!metadata) throw new Error('invalid room metadata');

        const aiFeatures = metadata.roomFeatures?.insightsFeatures?.aiFeatures;
        if (!aiFeatures?.isAllow || !aiFeatures.aiTextChatFeatures?.isAllow) {
            throw new Error("AI text chat feature isn't allowed for this room");
        }

        let foundUser = aiFeatures.aiTextChatFeatures.isAllowedEveryone;
        if (!foundUser) {
            if (aiFeatures.aiTextChatFeatures.allowedUserIds.includes(userId)) {
                foundUser = true;
            }
        }

        if (!foundUser) {
            throw new Error("you're not allowed to use this service");
        }

        return await firstValueFrom(
            this.natsClient.send<CommonResponse>('plug-n-meet-insights', payload)
        );
    }

    /**
     * MeetingSummarizationConfigure configures summarization
     */
    async meetingSummarizationConfigure(roomId: string, r: InsightsAIMeetingSummarizationConfigReq): Promise<CommonResponse> {
        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (!metadata) throw new Error('invalid room metadata');

        const aiFeatures = metadata.roomFeatures?.insightsFeatures?.aiFeatures;
        if (!aiFeatures?.isAllow || !aiFeatures.meetingSummarizationFeatures?.isAllow) {
            throw new Error("meeting summarization feature isn't allowed for this room");
        }

        if (metadata.roomFeatures?.endToEndEncryptionFeatures?.enabledSelfInsertEncryptionKey) {
            throw new Error('insights.feature-disable-while-e2ee-self-key-enabled');
        }

        // First: Update metadata
        aiFeatures.meetingSummarizationFeatures.isEnabled = true;
        aiFeatures.meetingSummarizationFeatures.summarizationPrompt = r.summarizationPrompt;

        // Second: Prepare and configure agent
        const roomInfo = await this.natsRoomService.getRoomInfo(roomId);
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.ConfigureAgent,
            service_type: InsightsServiceType.MeetingSummarizing,
            room_id: roomId,
            room_table_id: roomInfo ? Number(roomInfo.dbTableId) : 0,
            room_e2ee_key: metadata.roomFeatures?.endToEndEncryptionFeatures?.encryptionKey,
            capture_all_participants_tracks: true,
            hidden_agent: true,
            options: new TextEncoder().encode(r.summarizationPrompt),
        };

        await this.configureAgent(payload);

        // Third: Broadcast metadata update
        const updateMt = await this.natsRoomService.updateRoomMetadata(roomId, metadata!);
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
            roomId,
            updateMt,
        );

        // Fourth: Analytics
        await this.analyticsService.handleEvent(create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_INSIGHTS_AI_MEETING_SUMMARIZATION_STATUS,
            roomId: roomId,
            hsetValue: 'started',
        }));

        // Fifth: Notify room
        await this.natsSystemEvents.broadcastSystemNotificationToRoom(
            roomId,
            'insights.meeting-summarization.enabled-notification-all',
            NatsSystemNotificationTypes.NATS_SYSTEM_NOTIFICATION_INFO,
            true,
        );

        return create(CommonResponseSchema, { status: true, msg: 'success' });
    }

    async endAIMeetingSummarization(roomId: string): Promise<CommonResponse> {
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.EndRoomAgentByServiceName,
            service_type: InsightsServiceType.MeetingSummarizing,
            room_id: roomId,
            room_table_id: 0,
        };

        await this.configureAgent(payload);

        const metadata = await this.natsRoomService.getRoomMetadataStruct(roomId);
        if (metadata && metadata.roomFeatures?.insightsFeatures?.aiFeatures?.meetingSummarizationFeatures) {
            metadata.roomFeatures.insightsFeatures.aiFeatures.meetingSummarizationFeatures.isEnabled = false;
            const updateMt = await this.natsRoomService.updateRoomMetadata(roomId, metadata);
            await this.natsSystemEvents.broadcastSystemEventToRoom(
                NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
                roomId,
                updateMt,
            );
        }

        // Analytics
        await this.analyticsService.handleEvent(create(AnalyticsDataMsgSchema, {
            eventType: AnalyticsEventType.ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_INSIGHTS_AI_MEETING_SUMMARIZATION_STATUS,
            roomId: roomId,
            hsetValue: 'ended',
        }));

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
        let langs: { code: string; name: string }[] = [];
        if (serviceType === 'transcription') {
            langs = [
                { code: 'af-ZA', name: 'Afrikaans' },
                { code: 'am-ET', name: 'Amharic' },
                { code: 'ar-AE', name: 'Arabic (United Arab Emirates)' },
                { code: 'ar-BH', name: 'Arabic (Bahrain)' },
                { code: 'ar-DZ', name: 'Arabic (Algeria)' },
                { code: 'ar-EG', name: 'Arabic (Egypt)' },
                { code: 'ar-IL', name: 'Arabic (Israel)' },
                { code: 'ar-IQ', name: 'Arabic (Iraq)' },
                { code: 'ar-JO', name: 'Arabic (Jordan)' },
                { code: 'ar-KW', name: 'Arabic (Kuwait)' },
                { code: 'ar-LB', name: 'Arabic (Lebanon)' },
                { code: 'ar-LY', name: 'Arabic (Libya)' },
                { code: 'ar-MA', name: 'Arabic (Morocco)' },
                { code: 'ar-OM', name: 'Arabic (Oman)' },
                { code: 'ar-PS', name: 'Arabic (Palestinian Territories)' },
                { code: 'ar-QA', name: 'Arabic (Qatar)' },
                { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
                { code: 'ar-SY', name: 'Arabic (Syria)' },
                { code: 'ar-TN', name: 'Arabic (Tunisia)' },
                { code: 'ar-YE', name: 'Arabic (Yemen)' },
                { code: 'az-AZ', name: 'Azerbaijani' },
                { code: 'hy-AM', name: 'Armenian' },
                { code: 'sq-AL', name: 'Albanian' },
                { code: 'bg-BG', name: 'Bulgarian' },
                { code: 'bn-IN', name: 'Bengali (India)' },
                { code: 'bs-BA', name: 'Bosnian' },
                { code: 'eu-ES', name: 'Basque' },
                { code: 'my-MM', name: 'Burmese' },
                { code: 'ca-ES', name: 'Catalan' },
                { code: 'cs-CZ', name: 'Czech' },
                { code: 'hr-HR', name: 'Croatian' },
                { code: 'zh-CN', name: 'Chinese (Mandarin, Simplified)' },
                { code: 'wuu-CN', name: 'Chinese (Wu, Simplified)' },
                { code: 'zh-TW', name: 'Chinese (Taiwanese Mandarin)' },
                { code: 'zh-HK', name: 'Chinese (Cantonese, Traditional)' },
                { code: 'da-DK', name: 'Danish' },
                { code: 'nl-BE', name: 'Dutch (Belgium)' },
                { code: 'nl-NL', name: 'Dutch (Netherlands)' },
                { code: 'en-AU', name: 'English (Australia)' },
                { code: 'en-US', name: 'English (US)' },
                { code: 'en-GB', name: 'English (UK)' },
                { code: 'en-CA', name: 'English (Canada)' },
                { code: 'en-IN', name: 'English (India)' },
                { code: 'en-NG', name: 'English (Nigeria)' },
                { code: 'en-ZA', name: 'English (South Africa)' },
                { code: 'fi-FI', name: 'Finnish' },
                { code: 'fr-FR', name: 'French (France)' },
                { code: 'fr-CA', name: 'French (Canada)' },
                { code: 'de-DE', name: 'German (Germany)' },
                { code: 'el-GR', name: 'Greek' },
                { code: 'he-IL', name: 'Hebrew' },
                { code: 'hi-IN', name: 'Hindi (India)' },
                { code: 'id-ID', name: 'Indonesian' },
                { code: 'it-IT', name: 'Italian (Italy)' },
                { code: 'ja-JP', name: 'Japanese' },
                { code: 'ko-KR', name: 'Korean' },
                { code: 'nb-NO', name: 'Norwegian Bokmål' },
                { code: 'pl-PL', name: 'Polish' },
                { code: 'pt-BR', name: 'Portuguese (Brazil)' },
                { code: 'pt-PT', name: 'Portuguese (Portugal)' },
                { code: 'ro-RO', name: 'Romanian' },
                { code: 'ru-RU', name: 'Russian' },
                { code: 'es-ES', name: 'Spanish (Spain)' },
                { code: 'es-MX', name: 'Spanish (Mexico)' },
                { code: 'sv-SE', name: 'Swedish' },
                { code: 'th-TH', name: 'Thai' },
                { code: 'tr-TR', name: 'Turkish' },
                { code: 'uk-UA', name: 'Ukrainian' },
                { code: 'vi-VN', name: 'Vietnamese' },
            ];
        } else if (serviceType === 'translation') {
            langs = [
                { code: 'af', name: 'Afrikaans' },
                { code: 'sq', name: 'Albanian' },
                { code: 'ar', name: 'Arabic' },
                { code: 'hy', name: 'Armenian' },
                { code: 'bn', name: 'Bangla' },
                { code: 'bg', name: 'Bulgarian' },
                { code: 'ca', name: 'Catalan' },
                { code: 'zh-Hans', name: 'Chinese Simplified' },
                { code: 'zh-Hant', name: 'Chinese Traditional' },
                { code: 'hr', name: 'Croatian' },
                { code: 'cs', name: 'Czech' },
                { code: 'da', name: 'Danish' },
                { code: 'nl', name: 'Dutch' },
                { code: 'en', name: 'English' },
                { code: 'et', name: 'Estonian' },
                { code: 'fil', name: 'Filipino' },
                { code: 'fi', name: 'Finnish' },
                { code: 'fr', name: 'French' },
                { code: 'de', name: 'German' },
                { code: 'el', name: 'Greek' },
                { code: 'gu', name: 'Gujarati' },
                { code: 'he', name: 'Hebrew' },
                { code: 'hi', name: 'Hindi' },
                { code: 'hu', name: 'Hungarian' },
                { code: 'id', name: 'Indonesian' },
                { code: 'it', name: 'Italian' },
                { code: 'ja', name: 'Japanese' },
                { code: 'kn', name: 'Kannada' },
                { code: 'ko', name: 'Korean' },
                { code: 'lv', name: 'Latvian' },
                { code: 'lt', name: 'Lithuanian' },
                { code: 'ms', name: 'Malay' },
                { code: 'ml', name: 'Malayalam' },
                { code: 'mt', name: 'Maltese' },
                { code: 'mr', name: 'Marathi' },
                { code: 'nb', name: 'Norwegian' },
                { code: 'fa', name: 'Persian' },
                { code: 'pl', name: 'Polish' },
                { code: 'pt', name: 'Portuguese' },
                { code: 'ro', name: 'Romanian' },
                { code: 'ru', name: 'Russian' },
                { code: 'sk', name: 'Slovak' },
                { code: 'sl', name: 'Slovenian' },
                { code: 'es', name: 'Spanish' },
                { code: 'sv', name: 'Swedish' },
                { code: 'ta', name: 'Tamil' },
                { code: 'te', name: 'Telugu' },
                { code: 'th', name: 'Thai' },
                { code: 'tr', name: 'Turkish' },
                { code: 'uk', name: 'Ukrainian' },
                { code: 'ur', name: 'Urdu' },
                { code: 'vi', name: 'Vietnamese' },
                { code: 'cy', name: 'Welsh' },
            ];
        }
        return langs.map(l => create(InsightsSupportedLangInfoSchema, l));
    }

    /**
     * GetUserTaskStatus sends a request to the leader agent and waits for the user's task status.
     */
    async getUserTaskStatus(serviceType: InsightsServiceType, roomId: string, userId: string): Promise<Uint8Array> {
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.GetUserStatus,
            service_type: serviceType,
            room_id: roomId,
            room_table_id: 0,
            user_id: userId,
        };

        return await firstValueFrom(
            this.natsClient.send<Uint8Array>('plug-n-meet-insights', payload)
        );
    }

    /**
     * EndRoomAllAgentTasks sends a NATS request to stop all agents for a room
     */
    async endRoomAllAgentTasks(roomId: string): Promise<void> {
        const payload: InsightsTaskPayload = {
            task: InsightsTaskType.EndRoomAllAgents,
            service_type: InsightsServiceType.Unknown,
            room_id: roomId,
            room_table_id: 0,
        };

        try {
            await lastValueFrom(this.natsClient.emit('plug-n-meet-insights', payload).pipe(defaultIfEmpty(null)));
        } catch (error) {
            this.logger.error(`End all agent tasks failed: ${error.message}`);
        }
    }


    /**
     * OnAfterRoomEnded performs cleanup tasks after a room has ended
     */
    async onAfterRoomEnded(dbTableId: bigint | number, roomId: string, roomSid: string): Promise<void> {
        this.logger.log(`Cleanup insights for room: ${roomId}, sid: ${roomSid}`);

        // 1. End all agent tasks
        await this.endRoomAllAgentTasks(roomId);

        // 2. Create usage artifacts
        await this.artifactsService.createAllRoomUsageArtifacts(
            roomId,
            roomSid,
            typeof dbTableId === 'bigint' ? Number(dbTableId) : dbTableId,
        );
    }
}
