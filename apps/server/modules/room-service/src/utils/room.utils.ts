import {
  CreateRoomReq,
  RoomMetadata,
  ActiveRoomInfo,
  CommonNotifyEvent,
  LtiClaims,
  WebhookEvent,
  ActiveRoomInfoSchema,
  CopyrightConfSchema,
  RecordingFeaturesSchema,
  SharedNotePadFeaturesSchema,
  WhiteboardFeaturesSchema,
  ExternalMediaPlayerFeaturesSchema,
  WaitingRoomFeaturesSchema,
  BreakoutRoomFeaturesSchema,
  DisplayExternalLinkFeaturesSchema,
  IngressFeaturesSchema,
  PollsFeaturesSchema,
  LockSettingsSchema,
  LtiCustomDesignSchema,
  CreateRoomReqSchema,
  RoomCreateFeaturesSchema,
  RoomMetadataSchema,
  ChatFeaturesSchema,
  NotifyEventRoomSchema,
  LtiCustomParametersSchema,
  CommonNotifyEventSchema,
  SpeechToTextTranslationFeaturesSchema,
  EndToEndEncryptionFeaturesSchema,
  InsightsFeaturesSchema,
} from "@workspace/protocol";
import { create, toJson, fromJson, toJsonString, fromJsonString, type JsonValue } from '@bufbuild/protobuf';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface RoomDefaultSettings {
  maxParticipants?: number;
  maxDuration?: number;
  maxNumBreakoutRooms?: number;
}

export interface RoomConfig {
  copyrightConf?: {
    display: boolean;
    text: string;
    allowOverride?: boolean;
  };
  insightsEnabled?: boolean;
  insightsMaxTranscriptionLangs?: number;
  insightsMaxChatTransLangs?: number;
  speechToTextEnabled?: boolean;
  maxNumTranLangsAllowSelecting?: number;
  roomDefaultSettings?: RoomDefaultSettings;
  uploadMaxSize?: number;
  uploadMaxWhiteboardFile?: number;
  uploadAllowedTypes?: string[];
  sharedNotePadEnabled?: boolean;
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
    meta: RoomMetadata,
  ): ActiveRoomInfo {
    return create(ActiveRoomInfoSchema, {
      roomTitle: room.roomTitle,
      roomId: room.roomId,
      sid: room.sid,
      joinedParticipants: '0', // Initial creation
      isRunning: 1, // active
      isRecording: meta.isRecording ? 1 : 0,
      isActiveRtmp: meta.isActiveRtmp ? 1 : 0,
      webhookUrl: room.webhookUrl || '',
      isBreakoutRoom: meta.isBreakoutRoom ? 1 : 0,
      parentRoomId: meta.parentRoomId,
      creationTime: room.creationTime.toString(),
      metadata: room.metadata,
    });
  }

  /**
   * INTERNAL: Get snake_case format for NATS KV storage
   * 
   * NOTE: This uses manual snake_case mapping because:
   * 1. NATS KV storage format (internal only, not public API)
   * 2. No corresponding Protobuf message exists for this structure
   * 3. Different from public API responses (which use Protobuf)
   * 
   * DO NOT use this for API responses - use Protobuf messages instead
   */
  public static getSnakeCaseNatsKvRoomInfo(
    room: {
      roomId: string;
      sid: string;
      creationTime: number;
      metadata: string;
    },
    req: CreateRoomReq,
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

  // --- Defaults Logic

  public static setRoomDefaults(r: CreateRoomReq, config: RoomConfig) {
    if (!r.metadata) {
      r.metadata = this.createDefaultMetadata(r.roomId);
    }

    // refresh startedAt (Go sets on creation)
    r.metadata.startedAt = (Math.floor(Date.now() / 1000)).toString();

    // 1. Prepare Features (init objects)
    this.prepareDefaultRoomFeatures(r);

    // 2. Set Default Values (e.g. file sizes) based on server config
    this.setCreateRoomDefaultValues(
      r,
      config.uploadMaxSize,
      config.uploadMaxWhiteboardFile,
      config.uploadAllowedTypes,
      config.sharedNotePadEnabled,
    );

    // 3. Set Lock Settings (defaults to locked for share/whiteboard/notepad)
    this.setRoomDefaultLockSettings(r);

    // 4. Copyright Logic
    const copyrightConf = config.copyrightConf;
    const defaultCopyright = create(CopyrightConfSchema, {
      display: true,
      text: 'Powered by <a href="https://www.plugnmeet.org" target="_blank">plugNmeet</a>',
    });

    if (!copyrightConf) {
      if (!r.metadata.copyrightConf) {
        r.metadata.copyrightConf = defaultCopyright;
      }
    } else {
      const d = create(CopyrightConfSchema, {
        display: copyrightConf.display,
        text: copyrightConf.text,
      });
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
        if (rf.insightsFeatures.transcriptionFeatures) rf.insightsFeatures.transcriptionFeatures.isAllow = false;
        if (rf.insightsFeatures.chatTranslationFeatures) rf.insightsFeatures.chatTranslationFeatures.isAllow = false;
        if (rf.insightsFeatures.aiFeatures) rf.insightsFeatures.aiFeatures.isAllow = false;
      } else {
        if (rf.insightsFeatures.transcriptionFeatures) {
          rf.insightsFeatures.transcriptionFeatures.maxSelectedTransLangs =
            config.insightsMaxTranscriptionLangs || 2;
        }
        if (rf.insightsFeatures.chatTranslationFeatures) {
          rf.insightsFeatures.chatTranslationFeatures.maxSelectedTransLangs =
            config.insightsMaxChatTransLangs || 5;
        }
      }
    }

    // Speech Services
    if (rf.speechToTextTranslationFeatures) {
      if (!config.speechToTextEnabled) {
        rf.speechToTextTranslationFeatures.isAllow = false;
        rf.speechToTextTranslationFeatures.isAllowTranslation = false;
      } else if (config.maxNumTranLangsAllowSelecting) {
        rf.speechToTextTranslationFeatures.maxNumTranLangsAllowSelecting =
          config.maxNumTranLangsAllowSelecting;
      }
    }

    // 6. Global Limits
    this.setDefaultRoomSettings(config.roomDefaultSettings ?? {}, r);
  }

  private static createDefaultMetadata(roomId: string): RoomMetadata {
    return create(RoomMetadataSchema, {
      roomTitle: roomId,
      isRecording: false,
      isActiveRtmp: false,
      parentRoomId: '',
      isBreakoutRoom: false,
      startedAt: '0',
      roomFeatures: create(RoomCreateFeaturesSchema, {}),
      extraData: {},
    });
  }

  private static prepareDefaultRoomFeatures(r: CreateRoomReq) {
    if (!r.metadata!.roomFeatures) {
      r.metadata!.roomFeatures = this.createDefaultMetadata(
        r.roomId,
      ).roomFeatures;
    }
    const f = r.metadata!.roomFeatures!;

    // Initialize sub-features if missing (Go parity defaults)
    if (!f.recordingFeatures)
      f.recordingFeatures = create(RecordingFeaturesSchema, {
        isAllow: true,
        isAllowCloud: true,
        isAllowLocal: true,
        enableAutoCloudRecording: false,
      });
    if (!f.chatFeatures)
      f.chatFeatures = create(ChatFeaturesSchema, {
        isAllow: false,
        isAllowFileUpload: false,
      });
    if (!f.sharedNotePadFeatures)
      f.sharedNotePadFeatures = create(SharedNotePadFeaturesSchema, {
        isAllow: false,
        isActive: false,
        visible: false,
      });
    if (!f.whiteboardFeatures)
      f.whiteboardFeatures = create(WhiteboardFeaturesSchema, {
        isAllow: false,
        visible: false,
        whiteboardFileId: 'default',
        fileName: 'default',
        totalPages: 10,
      });
    if (!f.externalMediaPlayerFeatures)
      f.externalMediaPlayerFeatures = create(ExternalMediaPlayerFeaturesSchema, { isAllow: false, isActive: false });
    if (!f.waitingRoomFeatures)
      f.waitingRoomFeatures = create(WaitingRoomFeaturesSchema, { isActive: false, waitingRoomMsg: '' });
    if (!f.breakoutRoomFeatures)
      f.breakoutRoomFeatures = create(BreakoutRoomFeaturesSchema, {
        isAllow: false,
        isActive: false,
        allowedNumberRooms: 6,
      });
    if (!f.displayExternalLinkFeatures)
      f.displayExternalLinkFeatures = create(DisplayExternalLinkFeaturesSchema, { isAllow: false, isActive: false });
    if (!f.ingressFeatures)
      f.ingressFeatures = create(IngressFeaturesSchema, {
        isAllow: false,
      });
    if (!f.pollsFeatures) f.pollsFeatures = create(PollsFeaturesSchema, { isAllow: false, isActive: false });

    if (!f.speechToTextTranslationFeatures)
      f.speechToTextTranslationFeatures = create(SpeechToTextTranslationFeaturesSchema, {
        isAllow: false,
        isAllowTranslation: false,
      });

    if (!f.endToEndEncryptionFeatures)
      f.endToEndEncryptionFeatures = create(EndToEndEncryptionFeaturesSchema, {
        isEnabled: false,
      });

    if (!f.insightsFeatures)
      f.insightsFeatures = create(InsightsFeaturesSchema, {
        isAllow: false,
        transcriptionFeatures: {
          isAllow: false,
          maxSelectedTransLangs: 2,
        },
        chatTranslationFeatures: {
          isAllow: false,
          maxSelectedTransLangs: 5,
        },
      });
  }

  private static setCreateRoomDefaultValues(
    r: CreateRoomReq,
    uploadMaxSize?: number,
    uploadMaxWhiteboardFile?: number,
    uploadAllowedTypes?: string[],
    sharedNotePadEnabled?: boolean,
  ) {
    const f = r.metadata!.roomFeatures!;

    // AutoGenUserId default disabled (match Go: pointer bool)
    if (f.autoGenUserId === undefined) {
      f.autoGenUserId = false;
    }

    if (f.sharedNotePadFeatures?.isAllow && sharedNotePadEnabled === false) {
      f.sharedNotePadFeatures.isAllow = false;
    }

    if (f.chatFeatures?.isAllowFileUpload) {
      if (!f.chatFeatures.allowedFileTypes || f.chatFeatures.allowedFileTypes.length === 0) {
        f.chatFeatures.allowedFileTypes = uploadAllowedTypes && uploadAllowedTypes.length > 0
          ? uploadAllowedTypes
          : ['jpg', 'jpeg', 'png', 'gif', 'zip', 'pdf'];
      }
      f.chatFeatures.maxFileSize = (uploadMaxSize ?? 0).toString();
    }

    if (f.whiteboardFeatures?.isAllow) {
      const maxSize = uploadMaxWhiteboardFile ?? 30;
      if (!f.whiteboardFeatures.maxAllowedFileSize) {
        f.whiteboardFeatures.maxAllowedFileSize = maxSize.toString();
      }
    }

    if (f.breakoutRoomFeatures?.isAllow && f.breakoutRoomFeatures.allowedNumberRooms === 0) {
      f.breakoutRoomFeatures.allowedNumberRooms = 6;
    }

    if (f.endToEndEncryptionFeatures?.isEnabled && !f.endToEndEncryptionFeatures.enabledSelfInsertEncryptionKey) {
      f.endToEndEncryptionFeatures.encryptionKey = this.generateSecureRandomStrings(32);
    }
  }

  // --- SetDefaultRoomSettings ---
  public static setDefaultRoomSettings(
    s: RoomDefaultSettings,
    r: CreateRoomReq,
  ) {
    if (!s) return;

    if (s.maxParticipants && s.maxParticipants > 0) {
      if (
        r.maxParticipants === undefined ||
        r.maxParticipants === 0 ||
        r.maxParticipants > s.maxParticipants
      ) {
        r.maxParticipants = s.maxParticipants;
      }
    }

    if (s.maxDuration && s.maxDuration > 0) {
      if (r.metadata?.roomFeatures?.roomDuration) {
        if (
          r.metadata.roomFeatures.roomDuration === '0' ||
          Number(r.metadata.roomFeatures.roomDuration) > s.maxDuration
        ) {
          r.metadata.roomFeatures.roomDuration = s.maxDuration.toString();
        }
      } else if (r.metadata?.roomFeatures) {
        r.metadata.roomFeatures.roomDuration = s.maxDuration.toString();
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

  // ---  GenerateSecureRandomStrings ---
  public static generateSecureRandomStrings(length: number): string {
    try {
      return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
    } catch (e) {
      // Fallback to simpler random if crypto fails (unlikely in Node)
      return Math.random()
        .toString(36)
        .substring(2, length + 2);
    }
  }

  // --- PrepareCommonWebhookNotifyEvent ---
  // Note: Depends on receiving a LiveKit Webhook Event structure.
  // Simplifying assuming input is any matching the structure for now or generic map.
  public static prepareCommonWebhookNotifyEvent(event: WebhookEvent): CommonNotifyEvent {
    const room = event.room;
    return create(CommonNotifyEventSchema, {
      event: event.event,
      room: room ? create(NotifyEventRoomSchema, {
        sid: room.sid,
        roomId: room.name,
        emptyTimeout: room.emptyTimeout,
        maxParticipants: room.maxParticipants,
        creationTime: room.creationTime?.toString(),
        enabledCodecs: room.enabledCodecs,
        metadata: room.metadata,
        numParticipants: room.numParticipants,
      }) : undefined,
      participant: event.participant,
      track: event.track,
      id: event.id,
      createdAt: event.createdAt,
    });
  }

  // --- GetFilesFromDir ---
  public static async getFilesFromDir(
    dirPath: string,
    ext: string,
    sortOrder: 'asc' | 'des',
  ): Promise<string[]> {
    if (!fs.existsSync(dirPath)) return [];

    try {
      const files = await fs.promises.readdir(dirPath);
      const filtered = files.filter(
        (f) => path.extname(f) === ext && this.checkIfAllowedFilePrefix(f),
      );

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
    const allowedPrefix = ['main', 'runtime', 'vendor', 'tflite'];
    for (const p of allowedPrefix) {
      if (f.startsWith(p)) return true;
    }
    return false;
  }

  public static assignLTIV1CustomParams(
    params: URLSearchParams,
    claims: LtiClaims,
  ) {
    const customPara = create(LtiCustomParametersSchema, {
      roomDuration: params.get('custom_room_duration') || undefined,
      allowPolls:
        params.get('custom_allow_polls') === 'false' ? false : undefined,
      allowSharedNotePad:
        params.get('custom_allow_shared_note_pad') === 'false'
          ? false
          : undefined,
      allowBreakoutRoom:
        params.get('custom_allow_breakout_room') === 'false'
          ? false
          : undefined,
      allowRecording:
        params.get('custom_allow_recording') === 'false' ? false : undefined,
      allowRtmp:
        params.get('custom_allow_rtmp') === 'false' ? false : undefined,
      allowViewOtherWebcams:
        params.get('custom_allow_view_other_webcams') === 'false'
          ? false
          : undefined,
      allowViewOtherUsersList:
        params.get('custom_allow_view_other_users_list') === 'false'
          ? false
          : undefined,
      muteOnStart:
        params.get('custom_mute_on_start') === 'true' ? true : undefined,
      ltiCustomDesign: undefined, // Fix missing property
    });

    // Custom Design
    // Custom Design
    const customDesign = create(LtiCustomDesignSchema, {
      primaryColor: params.get('custom_primary_color') || undefined,
      secondaryColor: params.get('custom_secondary_color') || undefined,
      backgroundColor: params.get('custom_background_color') || undefined,
      customLogo: params.get('custom_custom_logo') || undefined,
    });

    // Assign only if not empty logic could be added but explicit undefined is fine for Proto helpers often
    claims.ltiCustomParameters = customPara;
    if (Object.values(customDesign).some((v) => v !== undefined)) {
      claims.ltiCustomParameters.ltiCustomDesign = customDesign;
    }
  }

  public static prepareLTIV1RoomCreateReq(c: LtiClaims): CreateRoomReq {
    const req = create(CreateRoomReqSchema, {
      roomId: c.roomId,
      metadata: create(RoomMetadataSchema, {
        roomTitle: c.roomTitle,
        roomFeatures: create(RoomCreateFeaturesSchema, {
          allowWebcams: true,
          allowScreenShare: true,
          allowRtmp: false, // RTMP disabled
          allowViewOtherWebcams: true,
          allowViewOtherUsersList: true,
          muteOnStart: false, // Added default
          adminOnlyWebcams: false, // Added default
          enableAnalytics: true, // Added default
          allowVirtualBg: true, // Added default
          allowRaiseHand: true, // Added default
          autoGenUserId: false, // Added default
          waitingRoomFeatures: create(WaitingRoomFeaturesSchema, { isActive: false, waitingRoomMsg: '' }), // Added default
          ingressFeatures: create(IngressFeaturesSchema, {
            isAllow: true,
            inputType: 0,
            url: '',
            streamKey: '',
          }), // Added default
          recordingFeatures: create(RecordingFeaturesSchema, {
            isAllow: false, // Recording disabled
            isAllowCloud: false, // disable
            isAllowLocal: false, // disable
            enableAutoCloudRecording: false,
            onlyRecordAdminWebcams: false,
          }),
          chatFeatures: create(ChatFeaturesSchema, {
            isAllow: true,
            isAllowFileUpload: true,
            allowedFileTypes: [],
            maxFileSize: '0',
          }),
          sharedNotePadFeatures: create(SharedNotePadFeaturesSchema, {
            isAllow: true,
            isActive: false,
            visible: false,
            nodeId: '',
            host: '',
            notePadId: '',
            readOnlyPadId: '',
          }),
          whiteboardFeatures: create(WhiteboardFeaturesSchema, {
            isAllow: true,
            visible: false,
            whiteboardFileId: '',
            fileName: '',
            filePath: '',
            totalPages: 0,
          }),
          externalMediaPlayerFeatures: create(ExternalMediaPlayerFeaturesSchema, { isAllow: true, isActive: false }),
          breakoutRoomFeatures: create(BreakoutRoomFeaturesSchema, {
            isAllow: true,
            isActive: false,
            allowedNumberRooms: 6,
          }),
          displayExternalLinkFeatures: create(DisplayExternalLinkFeaturesSchema, {
            isAllow: true,
            isActive: false,
            link: '',
            sharedBy: '',
          }),
          pollsFeatures: create(PollsFeaturesSchema, { isAllow: true, isActive: false }),
          speechToTextTranslationFeatures: create(SpeechToTextTranslationFeaturesSchema, {
            isAllow: false,
            isAllowTranslation: false,
            isEnabled: false,
            isEnabledTranslation: false,
            maxNumTranLangsAllowSelecting: 0,
            allowedSpeechLangs: [],
            allowedSpeechUsers: [],
            allowedTransLangs: [],
            defaultSubtitleLang: '',
          }), // Added defaults
          endToEndEncryptionFeatures: create(EndToEndEncryptionFeaturesSchema, {
            isEnabled: false,
            includedChatMessages: false,
            includedWhiteboard: false,
            enabledSelfInsertEncryptionKey: false,
            encryptionKey: '',
          }), // Added defaults
          insightsFeatures: create(InsightsFeaturesSchema, {
            isAllow: false,
            transcriptionFeatures: undefined,
            chatTranslationFeatures: undefined,
            aiFeatures: undefined,
          }),
          // Initialize others as needed or rely on Defaults method later
        }),
      }),
    });

    // Apply Custom Params if present
    if (c.ltiCustomParameters) {
      const p = c.ltiCustomParameters;
      const f = req.metadata!.roomFeatures!;

      if (p.roomDuration && Number(p.roomDuration) > 0) f.roomDuration = p.roomDuration;
      if (p.muteOnStart !== undefined) f.muteOnStart = p.muteOnStart;
      if (p.allowSharedNotePad !== undefined && f.sharedNotePadFeatures)
        f.sharedNotePadFeatures.isAllow = p.allowSharedNotePad;
      if (p.allowBreakoutRoom !== undefined && f.breakoutRoomFeatures)
        f.breakoutRoomFeatures.isAllow = p.allowBreakoutRoom;
      if (p.allowPolls !== undefined && f.pollsFeatures)
        f.pollsFeatures.isAllow = p.allowPolls;
      if (p.allowRecording !== undefined && f.recordingFeatures)
        f.recordingFeatures.isAllow = p.allowRecording;
      if (p.allowRtmp !== undefined) f.allowRtmp = p.allowRtmp;
      if (p.allowViewOtherWebcams !== undefined)
        f.allowViewOtherWebcams = p.allowViewOtherWebcams;
      if (p.allowViewOtherUsersList !== undefined)
        f.allowViewOtherUsersList = p.allowViewOtherUsersList;
    }

    return req;
  }

  private static setRoomDefaultLockSettings(r: CreateRoomReq) {
    if (!r.metadata!.defaultLockSettings) {
      r.metadata!.defaultLockSettings = create(LockSettingsSchema, {
        lockMicrophone: false,
        lockWebcam: false,
        lockScreenSharing: true,
        lockChat: false,
        lockChatSendMessage: false,
        lockChatFileShare: false,
        lockPrivateChat: false,
        lockWhiteboard: true,
        lockSharedNotepad: true,
      });
    } else {
      const d = r.metadata!.defaultLockSettings;
      if (d.lockScreenSharing === undefined || d.lockScreenSharing === null) d.lockScreenSharing = true;
      if (d.lockWhiteboard === undefined || d.lockWhiteboard === null) d.lockWhiteboard = true;
      if (d.lockSharedNotepad === undefined || d.lockSharedNotepad === null) d.lockSharedNotepad = true;
    }
  }

  /**
   * Convert RoomMetadata to Protocol JSON format
   * Uses @bufbuild/protobuf to automatically handle camelCase → snake_case
   */
  public static toProtocolMetadata(m: RoomMetadata): JsonValue {
    return toJson(RoomMetadataSchema, m);
  }

}
