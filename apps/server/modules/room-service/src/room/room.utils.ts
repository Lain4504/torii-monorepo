import {
    CreateRoomReq,
    RoomMetadata,
    RoomCreateFeatures,
    RecordingFeatures,
    ChatFeatures,
    SharedNotePadFeatures,
    WhiteboardFeatures,
    ExternalMediaPlayerFeatures,
    WaitingRoomFeatures,
    BreakoutRoomFeatures,
    DisplayExternalLinkFeatures,
    IngressFeatures,
    SpeechToTextTranslationFeatures,
    EndToEndEncryptionFeatures,
    PollsFeatures,
    InsightsFeatures,
    LockSettings,
    CopyrightConf,
    ActiveRoomInfo,
    CommonNotifyEvent,
    NotifyEventRoom,
    LtiClaims,
    LtiCustomParameters,
    LtiCustomDesign,
    CommonResponse,
} from '@server/proto';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface RoomDefaultSettings {
    maxParticipants?: number;
    maxDuration?: number;
    maxNumBreakoutRooms?: number;
}


export class RoomUtils {
    // --- Mappers for Response & KV ---

    public static toActiveRoomInfo(
        room: {
            roomId: string;
            sid: string;
            roomTitle: string;
            creationTime: number;
            metadata: string;
            webhookUrl?: string;
        },
        meta: RoomMetadata
    ): ActiveRoomInfo {
        return {
            roomTitle: room.roomTitle,
            roomId: room.roomId,
            sid: room.sid,
            joinedParticipants: 0, // Initial creation
            isRunning: 1, // active
            isRecording: meta.isRecording ? 1 : 0,
            isActiveRtmp: meta.isActiveRtmp ? 1 : 0,
            webhookUrl: room.webhookUrl || '',
            isBreakoutRoom: meta.isBreakoutRoom ? 1 : 0,
            parentRoomId: meta.parentRoomId,
            creationTime: room.creationTime,
            metadata: room.metadata,
        };
    }

    public static getSnakeCaseNatsKvRoomInfo(
        room: { roomId: string; sid: string; creationTime: number; metadata: string },
        req: CreateRoomReq
    ): any {
        return {
            room_id: room.roomId,
            room_sid: room.sid,
            status: 'active',
            empty_timeout: req.emptyTimeout || 60 * 60,
            max_participants: req.maxParticipants || 100,
            metadata: room.metadata,
            created_at: room.creationTime,
        };
    }

    // --- Defaults Logic (Mirroring Go: utils.PrepareDefaultRoomFeatures, etc.) ---

    public static setRoomDefaults(r: CreateRoomReq, config: any) {
        if (!r.metadata) {
            r.metadata = this.createDefaultMetadata(r.roomId);
        }

        // 1. Prepare Features (init objects)
        this.prepareDefaultRoomFeatures(r);

        // 2. Set Default Values (e.g. file sizes)
        this.setCreateRoomDefaultValues(r);

        // 3. Set Lock Settings
        this.setRoomDefaultLockSettings(r);

        // 4. Copyright Logic (Mirroring Go)
        const copyrightConf = config.copyrightConf;
        const defaultCopyright = {
            display: true,
            text: 'Powered by <a href="https://www.plugnmeet.org" target="_blank">plugNmeet</a>',
        };

        if (!copyrightConf) {
            if (!r.metadata.copyrightConf) {
                r.metadata.copyrightConf = defaultCopyright;
            }
        } else {
            const d = {
                display: copyrightConf.display,
                text: copyrightConf.text,
            };
            // If override not allowed, enforce server config
            if (r.metadata.copyrightConf && !copyrightConf.allowOverride) {
                r.metadata.copyrightConf = d;
            } else if (!r.metadata.copyrightConf) {
                r.metadata.copyrightConf = d;
            }
        }

        // 5. Config-based Logic (Analytics, Insights, Speech)
        if (r.metadata.isBreakoutRoom && r.metadata.roomFeatures?.enableAnalytics) {
            r.metadata.roomFeatures.enableAnalytics = false;
        }

        const rf = r.metadata.roomFeatures!;

        // Insights
        if (rf.insightsFeatures) {
            if (!config.insightsEnabled) {
                rf.insightsFeatures.isAllow = false;
            } else {
                if (rf.insightsFeatures.transcriptionFeatures) {
                    rf.insightsFeatures.transcriptionFeatures.maxSelectedTransLangs = config.maxSelectedOneTimeTransLangs || 2;
                }
                if (rf.insightsFeatures.chatTranslationFeatures) {
                    rf.insightsFeatures.chatTranslationFeatures.maxSelectedTransLangs = config.maxSelectedOneTimeTransLangs || 5;
                }
            }
        }

        // Speech Services (Azure/etc) - simplifying to check generic enable flag
        if (rf.speechToTextTranslationFeatures) {
            if (!config.speechToTextEnabled) {
                rf.speechToTextTranslationFeatures.isAllow = false;
            } else {
                if (config.maxNumTranLangsAllowSelecting) {
                    rf.speechToTextTranslationFeatures.maxNumTranLangsAllowSelecting = config.maxNumTranLangsAllowSelecting;
                }
            }
        }

        // 6. Global Limits
        this.setDefaultRoomSettings(config.roomDefaultSettings, r);
    }

    private static createDefaultMetadata(roomId: string): RoomMetadata {
        return {
            roomTitle: roomId,
            isRecording: false,
            isActiveRtmp: false,
            parentRoomId: '',
            isBreakoutRoom: false,
            startedAt: 0,
            roomFeatures: {
                allowWebcams: true,
                muteOnStart: false,
                allowScreenShare: true,
                allowRtmp: true,
                allowViewOtherWebcams: true,
                allowViewOtherUsersList: true,
                adminOnlyWebcams: false,
                enableAnalytics: true,
                allowVirtualBg: true,
                allowRaiseHand: true,
                recordingFeatures: {
                    isAllow: true,
                    isAllowCloud: true,
                    isAllowLocal: true,
                    enableAutoCloudRecording: false,
                    onlyRecordAdminWebcams: false,
                },
                chatFeatures: {
                    isAllow: true,
                    isAllowFileUpload: true,
                    allowedFileTypes: ['jpg', 'jpeg', 'png', 'zip', 'pdf'],
                    maxFileSize: 10 * 1024 * 1024,
                },
                sharedNotePadFeatures: { isAllow: true, isActive: false, visible: false, nodeId: '', host: '', notePadId: '', readOnlyPadId: '' },
                whiteboardFeatures: { isAllow: true, visible: false, whiteboardFileId: '', fileName: '', filePath: '', totalPages: 0 },
                externalMediaPlayerFeatures: { isAllow: true, isActive: false },
                waitingRoomFeatures: { isActive: false, waitingRoomMsg: '' },
                breakoutRoomFeatures: { isAllow: true, isActive: false, allowedNumberRooms: 6 },
                displayExternalLinkFeatures: { isAllow: true, isActive: false },
                ingressFeatures: { isAllow: true, inputType: 0, url: '', streamKey: '' },
                pollsFeatures: { isAllow: true, isActive: false },
                // ... insights default undefined
            },
            extraData: {},
        } as RoomMetadata;
    }

    private static prepareDefaultRoomFeatures(r: CreateRoomReq) {
        if (!r.metadata!.roomFeatures) {
            r.metadata!.roomFeatures = this.createDefaultMetadata(r.roomId).roomFeatures;
        }
        const f = r.metadata!.roomFeatures!;

        // Ensure strict booleans and sub-objects exist
        if (f.allowWebcams === undefined) f.allowWebcams = true;
        if (f.allowScreenShare === undefined) f.allowScreenShare = true;
        if (f.allowRtmp === undefined) f.allowRtmp = true;
        if (f.allowViewOtherWebcams === undefined) f.allowViewOtherWebcams = true;
        if (f.allowViewOtherUsersList === undefined) f.allowViewOtherUsersList = true;

        // Initializing sub-features if missing
        if (!f.recordingFeatures) f.recordingFeatures = { isAllow: true, isAllowCloud: true, isAllowLocal: true, enableAutoCloudRecording: false, onlyRecordAdminWebcams: false };
        if (!f.chatFeatures) f.chatFeatures = { isAllow: true, isAllowFileUpload: true, allowedFileTypes: [], maxFileSize: 0 };
        if (!f.sharedNotePadFeatures) f.sharedNotePadFeatures = { isAllow: true, isActive: false, visible: false, nodeId: '', host: '', notePadId: '', readOnlyPadId: '' };
        if (!f.whiteboardFeatures) f.whiteboardFeatures = { isAllow: true, visible: false, whiteboardFileId: '', fileName: '', filePath: '', totalPages: 0 };
        if (!f.externalMediaPlayerFeatures) f.externalMediaPlayerFeatures = { isAllow: true, isActive: false };
        if (!f.waitingRoomFeatures) f.waitingRoomFeatures = { isActive: false, waitingRoomMsg: '' };
        if (!f.breakoutRoomFeatures) f.breakoutRoomFeatures = { isAllow: true, isActive: false, allowedNumberRooms: 6 };
        if (!f.displayExternalLinkFeatures) f.displayExternalLinkFeatures = { isAllow: true, isActive: false };
        if (!f.ingressFeatures) f.ingressFeatures = { isAllow: true, inputType: 0, url: '', streamKey: '' };
        if (!f.pollsFeatures) f.pollsFeatures = { isAllow: true, isActive: false };
    }

    private static setCreateRoomDefaultValues(r: CreateRoomReq) {
        // defaults for file limits, etc.
        const f = r.metadata!.roomFeatures!;
        if (f.chatFeatures) {
            if (f.chatFeatures.allowedFileTypes.length === 0) {
                f.chatFeatures.allowedFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'zip', 'pdf'];
            }
            if (!f.chatFeatures.maxFileSize) {
                f.chatFeatures.maxFileSize = 0; // 0 = unlimited or handled by logic
            }
        }

        // Whiteboard size default
        if (f.whiteboardFeatures?.isAllow && !f.whiteboardFeatures.maxAllowedFileSize) {
            f.whiteboardFeatures.maxAllowedFileSize = 30; // Default 30MB
        }

        // Encryption key gen
        if (f.endToEndEncryptionFeatures?.isEnabled && !f.endToEndEncryptionFeatures.enabledSelfInsertEncryptionKey) {
            f.endToEndEncryptionFeatures.encryptionKey = this.generateSecureRandomStrings(32);
        }
    }

    // --- Clone of plugnmeet-protocol/utils/create_room.go: SetDefaultRoomSettings ---
    public static setDefaultRoomSettings(s: RoomDefaultSettings, r: CreateRoomReq) {
        if (!s) return;

        if (s.maxParticipants && s.maxParticipants > 0) {
            if (r.maxParticipants === undefined || r.maxParticipants === 0 || r.maxParticipants > s.maxParticipants) {
                r.maxParticipants = s.maxParticipants;
            }
        }

        if (s.maxDuration && s.maxDuration > 0) {
            if (r.metadata?.roomFeatures?.roomDuration) {
                if (r.metadata.roomFeatures.roomDuration === 0 || r.metadata.roomFeatures.roomDuration > s.maxDuration) {
                    r.metadata.roomFeatures.roomDuration = s.maxDuration;
                }
            } else if (r.metadata?.roomFeatures) {
                r.metadata.roomFeatures.roomDuration = s.maxDuration;
            }
        }

        if (r.emptyTimeout === undefined || r.emptyTimeout < 120) {
            r.emptyTimeout = 1800; // 30 mins
        }

        const maxBreakoutRooms = s.maxNumBreakoutRooms || 16; /* default 16 */
        if (r.metadata?.roomFeatures?.breakoutRoomFeatures) {
            const br = r.metadata.roomFeatures.breakoutRoomFeatures;
            if (br.allowedNumberRooms > maxBreakoutRooms) {
                br.allowedNumberRooms = maxBreakoutRooms;
            }
        }
    }

    // --- Clone of plugnmeet-protocol/utils/common.go: GenerateSecureRandomStrings ---
    public static generateSecureRandomStrings(length: number): string {
        try {
            return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
        } catch (e) {
            // Fallback to simpler random if crypto fails (unlikely in Node)
            return Math.random().toString(36).substring(2, length + 2);
        }
    }

    // --- Clone of plugnmeet-protocol/utils/common.go: PrepareCommonWebhookNotifyEvent ---
    // Note: Depends on receiving a LiveKit Webhook Event structure.
    // Simplifying assuming input is any matching the structure for now or generic map.
    public static prepareCommonWebhookNotifyEvent(event: any): CommonNotifyEvent {
        // Mapping logic mirroring Go.
        const room = event.room;
        return {
            event: event.event,
            room: {
                sid: room?.sid,
                roomId: room?.name,
                emptyTimeout: room?.emptyTimeout,
                maxParticipants: room?.maxParticipants,
                creationTime: room?.creationTime,
                enabledCodecs: room?.enabledCodecs || [],
                metadata: room?.metadata,
                numParticipants: room?.numParticipants,
            } as NotifyEventRoom,
            participant: event.participant,
            track: event.track,
            id: event.id,
            createdAt: event.createdAt,
        };
    }

    // --- Clone of plugnmeet-protocol/utils/common.go: GetFilesFromDir ---
    public static async getFilesFromDir(dirPath: string, ext: string, sortOrder: 'asc' | 'des'): Promise<string[]> {
        if (!fs.existsSync(dirPath)) return [];

        try {
            const files = await fs.promises.readdir(dirPath);
            const filtered = files.filter(f => path.extname(f) === ext && this.checkIfAllowedFilePrefix(f));

            if (sortOrder === 'asc') {
                filtered.sort();
            } else {
                filtered.sort().reverse();
            }
            return filtered;
        } catch (e) {
            return [];
        }
    }

    private static checkIfAllowedFilePrefix(f: string): boolean {
        const allowedPrefix = ["main", "runtime", "vendor", "tflite"];
        for (const p of allowedPrefix) {
            if (f.startsWith(p)) return true;
        }
        return false;
    }

    // --- Clone of plugnmeet-protocol/utils/lti_v1.go ---

    public static assignLTIV1CustomParams(params: URLSearchParams, claims: LtiClaims) {
        const customPara: LtiCustomParameters = {
            roomDuration: params.get("custom_room_duration") ? parseInt(params.get("custom_room_duration")!) : undefined,
            allowPolls: params.get("custom_allow_polls") === "false" ? false : undefined,
            allowSharedNotePad: params.get("custom_allow_shared_note_pad") === "false" ? false : undefined,
            allowBreakoutRoom: params.get("custom_allow_breakout_room") === "false" ? false : undefined,
            allowRecording: params.get("custom_allow_recording") === "false" ? false : undefined,
            allowRtmp: params.get("custom_allow_rtmp") === "false" ? false : undefined,
            allowViewOtherWebcams: params.get("custom_allow_view_other_webcams") === "false" ? false : undefined,
            allowViewOtherUsersList: params.get("custom_allow_view_other_users_list") === "false" ? false : undefined,
            muteOnStart: params.get("custom_mute_on_start") === "true" ? true : undefined,
            ltiCustomDesign: undefined, // Fix missing property
        };

        // Custom Design
        const customDesign: LtiCustomDesign = {
            primaryColor: params.get("custom_primary_color") || undefined,
            secondaryColor: params.get("custom_secondary_color") || undefined,
            backgroundColor: params.get("custom_background_color") || undefined,
            customLogo: params.get("custom_custom_logo") || undefined,
        };

        // Assign only if not empty logic could be added but explicit undefined is fine for Proto helpers often
        claims.ltiCustomParameters = customPara;
        if (Object.values(customDesign).some(v => v !== undefined)) {
            claims.ltiCustomParameters.ltiCustomDesign = customDesign;
        }
    }

    public static prepareLTIV1RoomCreateReq(c: LtiClaims): CreateRoomReq {
        const req: CreateRoomReq = {
            roomId: c.roomId,
            metadata: {
                roomTitle: c.roomTitle,
                roomFeatures: {
                    allowWebcams: true,
                    allowScreenShare: true,
                    allowRtmp: true,
                    allowViewOtherWebcams: true,
                    allowViewOtherUsersList: true,
                    muteOnStart: false, // Added default
                    adminOnlyWebcams: false, // Added default
                    enableAnalytics: true, // Added default
                    allowVirtualBg: true, // Added default
                    allowRaiseHand: true, // Added default
                    autoGenUserId: false, // Added default
                    waitingRoomFeatures: { isActive: false, waitingRoomMsg: '' }, // Added default
                    ingressFeatures: { isAllow: true, inputType: 0, url: '', streamKey: '' }, // Added default
                    recordingFeatures: { isAllow: true, isAllowCloud: true, isAllowLocal: true, enableAutoCloudRecording: false, onlyRecordAdminWebcams: false },
                    chatFeatures: { isAllow: true, isAllowFileUpload: true, allowedFileTypes: [], maxFileSize: 0 },
                    sharedNotePadFeatures: { isAllow: true, isActive: false, visible: false, nodeId: '', host: '', notePadId: '', readOnlyPadId: '' },
                    whiteboardFeatures: { isAllow: true, visible: false, whiteboardFileId: '', fileName: '', filePath: '', totalPages: 0 },
                    externalMediaPlayerFeatures: { isAllow: true, isActive: false },
                    breakoutRoomFeatures: { isAllow: true, isActive: false, allowedNumberRooms: 6 },
                    displayExternalLinkFeatures: { isAllow: true, isActive: false, link: '', sharedBy: '' },
                    pollsFeatures: { isAllow: true, isActive: false },
                    speechToTextTranslationFeatures: { isAllow: false, isAllowTranslation: false, isEnabled: false, isEnabledTranslation: false, maxNumTranLangsAllowSelecting: 0, allowedSpeechLangs: [], allowedSpeechUsers: [], allowedTransLangs: [], defaultSubtitleLang: '' }, // Added defaults
                    endToEndEncryptionFeatures: { isEnabled: false, includedChatMessages: false, includedWhiteboard: false, enabledSelfInsertEncryptionKey: false, encryptionKey: '' }, // Added defaults
                    insightsFeatures: { isAllow: false, transcriptionFeatures: undefined, chatTranslationFeatures: undefined, aiFeatures: undefined },
                    // Initialize others as needed or rely on Defaults method later
                } as RoomCreateFeatures,
            } as RoomMetadata,
        };

        // Apply Custom Params if present
        if (c.ltiCustomParameters) {
            const p = c.ltiCustomParameters;
            const f = req.metadata!.roomFeatures!;

            if (p.roomDuration && p.roomDuration > 0) f.roomDuration = p.roomDuration;
            if (p.muteOnStart !== undefined) f.muteOnStart = p.muteOnStart;
            if (p.allowSharedNotePad !== undefined && f.sharedNotePadFeatures) f.sharedNotePadFeatures.isAllow = p.allowSharedNotePad;
            if (p.allowBreakoutRoom !== undefined && f.breakoutRoomFeatures) f.breakoutRoomFeatures.isAllow = p.allowBreakoutRoom;
            if (p.allowPolls !== undefined && f.pollsFeatures) f.pollsFeatures.isAllow = p.allowPolls;
            if (p.allowRecording !== undefined && f.recordingFeatures) f.recordingFeatures.isAllow = p.allowRecording;
            if (p.allowRtmp !== undefined) f.allowRtmp = p.allowRtmp;
            if (p.allowViewOtherWebcams !== undefined) f.allowViewOtherWebcams = p.allowViewOtherWebcams;
            if (p.allowViewOtherUsersList !== undefined) f.allowViewOtherUsersList = p.allowViewOtherUsersList;
        }

        return req;
    }


    private static setRoomDefaultLockSettings(r: CreateRoomReq) {
        if (!r.metadata!.defaultLockSettings) {
            r.metadata!.defaultLockSettings = {
                lockMicrophone: false,
                lockWebcam: false,
                lockScreenSharing: false,
                lockChat: false,
                lockChatSendMessage: false,
                lockChatFileShare: false,
                lockPrivateChat: false,
                lockWhiteboard: false,
                lockSharedNotepad: false,
            };
        }
    }

    // --- Snake Case Serialization (Crucial for Client compatibility) ---

    public static toProtocolMetadata(m: RoomMetadata): any {
        return {
            room_title: m.roomTitle,
            welcome_message: m.welcomeMessage,
            is_recording: m.isRecording,
            is_active_rtmp: m.isActiveRtmp,
            parent_room_id: m.parentRoomId,
            is_breakout_room: m.isBreakoutRoom,
            webhook_url: m.webhookUrl,
            started_at: m.startedAt,
            logout_url: m.logoutUrl,
            room_features: this.mapRoomFeatures(m.roomFeatures),
            default_lock_settings: this.mapLockSettings(m.defaultLockSettings),
            copyright_conf: this.mapCopyrightConf(m.copyrightConf),
            metadata_id: m.metadataId,
            extra_data: m.extraData,
        };
    }

    private static mapRoomFeatures(f?: RoomCreateFeatures): any {
        if (!f) return undefined;
        return {
            allow_webcams: f.allowWebcams,
            mute_on_start: f.muteOnStart,
            allow_screen_share: f.allowScreenShare,
            allow_rtmp: f.allowRtmp,
            allow_view_other_webcams: f.allowViewOtherWebcams,
            allow_view_other_users_list: f.allowViewOtherUsersList,
            admin_only_webcams: f.adminOnlyWebcams,
            allow_polls: f.allowPolls, // deprecated but mapped
            room_duration: f.roomDuration,
            enable_analytics: f.enableAnalytics,
            allow_virtual_bg: f.allowVirtualBg,
            allow_raise_hand: f.allowRaiseHand,
            auto_gen_user_id: f.autoGenUserId,
            recording_features: this.mapRecordingFeatures(f.recordingFeatures),
            chat_features: this.mapChatFeatures(f.chatFeatures),
            shared_note_pad_features: this.mapSharedNotePadFeatures(f.sharedNotePadFeatures),
            whiteboard_features: this.mapWhiteboardFeatures(f.whiteboardFeatures),
            external_media_player_features: this.mapExternalMediaPlayerFeatures(f.externalMediaPlayerFeatures),
            waiting_room_features: this.mapWaitingRoomFeatures(f.waitingRoomFeatures),
            breakout_room_features: this.mapBreakoutRoomFeatures(f.breakoutRoomFeatures),
            display_external_link_features: this.mapDisplayExternalLinkFeatures(f.displayExternalLinkFeatures),
            ingress_features: this.mapIngressFeatures(f.ingressFeatures),
            speech_to_text_translation_features: this.mapSpeechToTextTranslationFeatures(f.speechToTextTranslationFeatures),
            end_to_end_encryption_features: this.mapEndToEndEncryptionFeatures(f.endToEndEncryptionFeatures),
            polls_features: this.mapPollsFeatures(f.pollsFeatures),
            insights_features: this.mapInsightsFeatures(f.insightsFeatures),
        };
    }

    private static mapRecordingFeatures(f?: RecordingFeatures): any {
        if (!f) return undefined;
        return {
            is_allow: f.isAllow,
            is_allow_cloud: f.isAllowCloud,
            enable_auto_cloud_recording: f.enableAutoCloudRecording,
            is_allow_local: f.isAllowLocal,
            only_record_admin_webcams: f.onlyRecordAdminWebcams,
        };
    }

    private static mapChatFeatures(f?: ChatFeatures): any {
        if (!f) return undefined;
        return {
            allow_chat: f.allowChat, // deprecated
            allow_file_upload: f.allowFileUpload, // deprecated
            is_allow: f.isAllow,
            is_allow_file_upload: f.isAllowFileUpload,
            allowed_file_types: f.allowedFileTypes,
            max_file_size: f.maxFileSize,
        };
    }

    private static mapSharedNotePadFeatures(f?: SharedNotePadFeatures): any {
        if (!f) return undefined;
        return {
            allowed_shared_note_pad: f.allowedSharedNotePad, // deprecated
            is_allow: f.isAllow,
            is_active: f.isActive,
            visible: f.visible,
            node_id: f.nodeId,
            host: f.host,
            note_pad_id: f.notePadId,
            read_only_pad_id: f.readOnlyPadId,
        };
    }

    private static mapWhiteboardFeatures(f?: WhiteboardFeatures): any {
        if (!f) return undefined;
        return {
            allowed_whiteboard: f.allowedWhiteboard, // deprecated
            is_allow: f.isAllow,
            visible: f.visible,
            preload_file: f.preloadFile,
            whiteboard_file_id: f.whiteboardFileId,
            file_name: f.fileName,
            file_path: f.filePath,
            total_pages: f.totalPages,
            max_allowed_file_size: f.maxAllowedFileSize,
        };
    }

    private static mapExternalMediaPlayerFeatures(f?: ExternalMediaPlayerFeatures): any {
        if (!f) return undefined;
        return {
            allowed_external_media_player: f.allowedExternalMediaPlayer, // deprecated
            is_allow: f.isAllow,
            is_active: f.isActive,
            shared_by: f.sharedBy,
            url: f.url,
        };
    }

    private static mapWaitingRoomFeatures(f?: WaitingRoomFeatures): any {
        if (!f) return undefined;
        return {
            is_active: f.isActive,
            waiting_room_msg: f.waitingRoomMsg,
        };
    }

    private static mapBreakoutRoomFeatures(f?: BreakoutRoomFeatures): any {
        if (!f) return undefined;
        return {
            is_allow: f.isAllow,
            is_active: f.isActive,
            allowed_number_rooms: f.allowedNumberRooms,
        };
    }

    private static mapDisplayExternalLinkFeatures(f?: DisplayExternalLinkFeatures): any {
        if (!f) return undefined;
        return {
            is_allow: f.isAllow,
            is_active: f.isActive,
            link: f.link,
            shared_by: f.sharedBy,
        };
    }

    private static mapIngressFeatures(f?: IngressFeatures): any {
        if (!f) return undefined;
        return {
            is_allow: f.isAllow,
            input_type: f.inputType,
            url: f.url,
            stream_key: f.streamKey,
        };
    }

    private static mapSpeechToTextTranslationFeatures(f?: SpeechToTextTranslationFeatures): any {
        if (!f) return undefined;
        return {
            is_allow: f.isAllow,
            is_allow_translation: f.isAllowTranslation,
            is_enabled: f.isEnabled,
            is_enabled_translation: f.isEnabledTranslation,
            max_num_tran_langs_allow_selecting: f.maxNumTranLangsAllowSelecting,
            allowed_speech_langs: f.allowedSpeechLangs,
            allowed_speech_users: f.allowedSpeechUsers,
            allowed_trans_langs: f.allowedTransLangs,
            default_subtitle_lang: f.defaultSubtitleLang,
        };
    }

    private static mapEndToEndEncryptionFeatures(f?: EndToEndEncryptionFeatures): any {
        if (!f) return undefined;
        return {
            is_enabled: f.isEnabled,
            included_chat_messages: f.includedChatMessages,
            included_whiteboard: f.includedWhiteboard,
            enabled_self_insert_encryption_key: f.enabledSelfInsertEncryptionKey,
            encryption_key: f.encryptionKey,
        };
    }

    private static mapPollsFeatures(f?: PollsFeatures): any {
        if (!f) return undefined;
        return {
            is_allow: f.isAllow,
            is_active: f.isActive,
        };
    }

    private static mapInsightsFeatures(f?: InsightsFeatures): any {
        if (!f) return undefined;
        // We can expand this with sub-maps if needed, but for now simple recursion or direct mapping if structure matches
        // Since InsightsFeatures has sub-objects, we should map them too to be safe/consistent
        return {
            is_allow: f.isAllow,
            transcription_features: this.mapInsightsTranscriptionFeatures(f.transcriptionFeatures),
            chat_translation_features: this.mapInsightsChatTranslationFeatures(f.chatTranslationFeatures),
            ai_features: this.mapInsightsAIFeatures(f.aiFeatures),
        };
    }

    private static mapInsightsTranscriptionFeatures(f?: any): any {
        if (!f) return undefined;
        return {
            is_allow: f.isAllow,
            is_allow_translation: f.isAllowTranslation,
            is_allow_speech_synthesis: f.isAllowSpeechSynthesis,
            is_enabled: f.isEnabled,
            allowed_spoken_langs: f.allowedSpokenLangs,
            allowed_speech_users: f.allowedSpeechUsers,
            is_enabled_translation: f.isEnabledTranslation,
            max_selected_trans_langs: f.maxSelectedTransLangs,
            allowed_trans_langs: f.allowedTransLangs,
            default_subtitle_lang: f.defaultSubtitleLang,
            is_enabled_speech_synthesis: f.isEnabledSpeechSynthesis
        }
    }

    private static mapInsightsChatTranslationFeatures(f?: any): any {
        if (!f) return undefined;
        return {
            is_allow: f.isAllow,
            is_enabled: f.isEnabled,
            allowed_trans_langs: f.allowedTransLangs,
            max_selected_trans_langs: f.maxSelectedTransLangs,
            default_lang: f.defaultLang
        }
    }

    private static mapInsightsAIFeatures(f?: any): any {
        if (!f) return undefined;
        return {
            is_allow: f.isAllow,
            ai_text_chat_features: f.aiTextChatFeatures ? {
                is_allow: f.aiTextChatFeatures.isAllow,
                is_enabled: f.aiTextChatFeatures.isEnabled,
                is_allowed_everyone: f.aiTextChatFeatures.isAllowedEveryone,
                allowed_user_ids: f.aiTextChatFeatures.allowedUserIds
            } : undefined,
            meeting_summarization_features: f.meetingSummarizationFeatures ? {
                is_allow: f.meetingSummarizationFeatures.isAllow,
                summarization_prompt: f.meetingSummarizationFeatures.summarizationPrompt,
                is_enabled: f.meetingSummarizationFeatures.isEnabled,
            } : undefined
        }
    }

    private static mapLockSettings(l?: LockSettings): any {
        if (!l) return undefined;
        return {
            lock_microphone: l.lockMicrophone,
            lock_webcam: l.lockWebcam,
            lock_screen_sharing: l.lockScreenSharing,
            lock_chat: l.lockChat,
            lock_chat_send_message: l.lockChatSendMessage,
            lock_chat_file_share: l.lockChatFileShare,
            lock_private_chat: l.lockPrivateChat,
            lock_whiteboard: l.lockWhiteboard,
            lock_shared_notepad: l.lockSharedNotepad,
        };
    }

    private static mapCopyrightConf(c?: CopyrightConf): any {
        if (!c) return undefined;
        return {
            display: c.display,
            text: c.text,
        };
    }

    // --- Snake to Camel Case Conversion (For Client Compatibility) ---

    public static convertSnakeToCamelCaseMetadata(metadataStr: string): string {
        try {
            if (!metadataStr || metadataStr === "") return "{}";
            const snake = JSON.parse(metadataStr);
            const camel: any = {
                roomTitle: snake.room_title,
                welcomeMessage: snake.welcome_message,
                isRecording: snake.is_recording,
                isActiveRtmp: snake.is_active_rtmp,
                parentRoomId: snake.parent_room_id,
                isBreakoutRoom: snake.is_breakout_room,
                webhookUrl: snake.webhook_url,
                startedAt: snake.started_at,
                logoutUrl: snake.logout_url,
                roomFeatures: this.mapSnakeRoomFeatures(snake.room_features),
                defaultLockSettings: this.mapSnakeLockSettings(snake.default_lock_settings),
                copyrightConf: this.mapSnakeCopyrightConf(snake.copyright_conf),
                metadataId: snake.metadata_id,
                extraData: snake.extra_data,
            };
            // Also preserve any top-level keys that might be relevant (like isAdmin, isPresenter if injected)
            if (snake.isAdmin !== undefined) camel.isAdmin = snake.isAdmin;
            if (snake.isPresenter !== undefined) camel.isPresenter = snake.isPresenter;

            return JSON.stringify(camel);
        } catch (e) {
            console.error("Error converting metadata case:", e);
            return metadataStr; // Fallback to original if parse fails
        }
    }

    private static mapSnakeRoomFeatures(f: any): any {
        if (!f) return undefined;
        return {
            allowWebcams: f.allow_webcams,
            muteOnStart: f.mute_on_start,
            allowScreenShare: f.allow_screen_share,
            allowRtmp: f.allow_rtmp,
            allowViewOtherWebcams: f.allow_view_other_webcams,
            allowViewOtherUsersList: f.allow_view_other_users_list,
            adminOnlyWebcams: f.admin_only_webcams,
            allowPolls: f.allow_polls,
            roomDuration: f.room_duration,
            enableAnalytics: f.enable_analytics,
            allowVirtualBg: f.allow_virtual_bg,
            allowRaiseHand: f.allow_raise_hand,
            autoGenUserId: f.auto_gen_user_id,
            recordingFeatures: this.mapSnakeRecordingFeatures(f.recording_features),
            chatFeatures: this.mapSnakeChatFeatures(f.chat_features),
            sharedNotePadFeatures: this.mapSnakeSharedNotePadFeatures(f.shared_note_pad_features),
            whiteboardFeatures: this.mapSnakeWhiteboardFeatures(f.whiteboard_features),
            externalMediaPlayerFeatures: this.mapSnakeExternalMediaPlayerFeatures(f.external_media_player_features),
            waitingRoomFeatures: this.mapSnakeWaitingRoomFeatures(f.waiting_room_features),
            breakoutRoomFeatures: this.mapSnakeBreakoutRoomFeatures(f.breakout_room_features),
            displayExternalLinkFeatures: this.mapSnakeDisplayExternalLinkFeatures(f.display_external_link_features),
            ingressFeatures: this.mapSnakeIngressFeatures(f.ingress_features),
            speechToTextTranslationFeatures: this.mapSnakeSpeechToTextTranslationFeatures(f.speech_to_text_translation_features),
            endToEndEncryptionFeatures: this.mapSnakeEndToEndEncryptionFeatures(f.end_to_end_encryption_features),
            pollsFeatures: this.mapSnakePollsFeatures(f.polls_features),
            insightsFeatures: this.mapSnakeInsightsFeatures(f.insights_features),
        };
    }

    private static mapSnakeRecordingFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            isAllowCloud: f.is_allow_cloud,
            enableAutoCloudRecording: f.enable_auto_cloud_recording,
            isAllowLocal: f.is_allow_local,
            onlyRecordAdminWebcams: f.only_record_admin_webcams,
        };
    }

    private static mapSnakeChatFeatures(f: any): any {
        if (!f) return undefined;
        return {
            allowChat: f.allow_chat,
            allowFileUpload: f.allow_file_upload,
            isAllow: f.is_allow,
            isAllowFileUpload: f.is_allow_file_upload,
            allowedFileTypes: f.allowed_file_types,
            maxFileSize: f.max_file_size,
        };
    }

    private static mapSnakeSharedNotePadFeatures(f: any): any {
        if (!f) return undefined;
        return {
            allowedSharedNotePad: f.allowed_shared_note_pad,
            isAllow: f.is_allow,
            isActive: f.is_active,
            visible: f.visible,
            nodeId: f.node_id,
            host: f.host,
            notePadId: f.note_pad_id,
            readOnlyPadId: f.read_only_pad_id,
        };
    }

    private static mapSnakeWhiteboardFeatures(f: any): any {
        if (!f) return undefined;
        return {
            allowedWhiteboard: f.allowed_whiteboard,
            isAllow: f.is_allow,
            visible: f.visible,
            preloadFile: f.preload_file,
            whiteboardFileId: f.whiteboard_file_id,
            fileName: f.file_name,
            filePath: f.file_path,
            totalPages: f.total_pages,
            maxAllowedFileSize: f.max_allowed_file_size,
        };
    }

    private static mapSnakeExternalMediaPlayerFeatures(f: any): any {
        if (!f) return undefined;
        return {
            allowedExternalMediaPlayer: f.allowed_external_media_player,
            isAllow: f.is_allow,
            isActive: f.is_active,
            sharedBy: f.shared_by,
            url: f.url,
        };
    }

    private static mapSnakeWaitingRoomFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isActive: f.is_active,
            waitingRoomMsg: f.waiting_room_msg,
        };
    }

    private static mapSnakeBreakoutRoomFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            isActive: f.is_active,
            allowedNumberRooms: f.allowed_number_rooms,
        };
    }

    private static mapSnakeDisplayExternalLinkFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            isActive: f.is_active,
            link: f.link,
            sharedBy: f.shared_by,
        };
    }

    private static mapSnakeIngressFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            inputType: f.input_type,
            url: f.url,
            streamKey: f.stream_key,
        };
    }

    private static mapSnakeSpeechToTextTranslationFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            isAllowTranslation: f.is_allow_translation,
            isEnabled: f.is_enabled,
            isEnabledTranslation: f.is_enabled_translation,
            maxNumTranLangsAllowSelecting: f.max_num_tran_langs_allow_selecting,
            allowedSpeechLangs: f.allowed_speech_langs,
            allowedSpeechUsers: f.allowed_speech_users,
            allowedTransLangs: f.allowed_trans_langs,
            defaultSubtitleLang: f.default_subtitle_lang,
        };
    }

    private static mapSnakeEndToEndEncryptionFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isEnabled: f.is_enabled,
            includedChatMessages: f.included_chat_messages,
            includedWhiteboard: f.included_whiteboard,
            enabledSelfInsertEncryptionKey: f.enabled_self_insert_encryption_key,
            encryptionKey: f.encryption_key,
        };
    }

    private static mapSnakePollsFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            isActive: f.is_active,
        };
    }

    private static mapSnakeInsightsFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            transcriptionFeatures: this.mapSnakeInsightsTranscriptionFeatures(f.transcription_features),
            chatTranslationFeatures: this.mapSnakeInsightsChatTranslationFeatures(f.chat_translation_features),
            aiFeatures: this.mapSnakeInsightsAIFeatures(f.ai_features),
        };
    }

    private static mapSnakeInsightsTranscriptionFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            isAllowTranslation: f.is_allow_translation,
            isAllowSpeechSynthesis: f.is_allow_speech_synthesis,
            isEnabled: f.is_enabled,
            allowedSpokenLangs: f.allowed_spoken_langs,
            allowedSpeechUsers: f.allowed_speech_users,
            isEnabledTranslation: f.is_enabled_translation,
            maxSelectedTransLangs: f.max_selected_trans_langs,
            allowedTransLangs: f.allowed_trans_langs,
            defaultSubtitleLang: f.default_subtitle_lang,
            isEnabledSpeechSynthesis: f.is_enabled_speech_synthesis,
        };
    }

    private static mapSnakeInsightsChatTranslationFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            isEnabled: f.is_enabled,
            allowedTransLangs: f.allowed_trans_langs,
            maxSelectedTransLangs: f.max_selected_trans_langs,
            defaultLang: f.default_lang,
        };
    }

    private static mapSnakeInsightsAIFeatures(f: any): any {
        if (!f) return undefined;
        return {
            isAllow: f.is_allow,
            aiTextChatFeatures: f.ai_text_chat_features ? {
                isAllow: f.ai_text_chat_features.is_allow,
                isEnabled: f.ai_text_chat_features.is_enabled,
                isAllowedEveryone: f.ai_text_chat_features.is_allowed_everyone,
                allowedUserIds: f.ai_text_chat_features.allowed_user_ids
            } : undefined,
            meetingSummarizationFeatures: f.meeting_summarization_features ? {
                isAllow: f.meeting_summarization_features.is_allow,
                summarizationPrompt: f.meeting_summarization_features.summarization_prompt,
                isEnabled: f.meeting_summarization_features.is_enabled,
            } : undefined
        };
    }

    private static mapSnakeLockSettings(l: any): any {
        if (!l) return undefined;
        return {
            lockMicrophone: l.lock_microphone,
            lockWebcam: l.lock_webcam,
            lockScreenSharing: l.lock_screen_sharing,
            lockChat: l.lock_chat,
            lockChatSendMessage: l.lock_chat_send_message,
            lockChatFileShare: l.lock_chat_file_share,
            lockPrivateChat: l.lock_private_chat,
            lockWhiteboard: l.lock_whiteboard,
            lockSharedNotepad: l.lock_shared_notepad,
        };
    }

    private static mapSnakeCopyrightConf(c: any): any {
        if (!c) return undefined;
        return {
            display: c.display,
            text: c.text,
        };
    }
}
