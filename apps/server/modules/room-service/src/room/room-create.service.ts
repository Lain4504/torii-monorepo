/**
 * Room Create Service
 *
 * Handles room creation logic with all validation and defaults
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { create } from '@bufbuild/protobuf';
import type {
    CreateRoomReq,
    ActiveRoomInfo,
    RoomMetadata,
    CopyrightConf,
    CommonNotifyEvent,
    NotifyEventRoom,
} from '@workspace/protocol';
import {
    ActiveRoomInfoSchema,
    CopyrightConfSchema,
    CommonNotifyEventSchema,
    NotifyEventRoomSchema,
} from '@workspace/protocol';
import {
    prepareDefaultRoomFeatures,
    setCreateRoomDefaultValues,
    setRoomDefaultLockSettings,
    setDefaultRoomSettings,
    type RoomDefaultSettings,
} from '@server/shared';
import { RedisLockService } from '../redis/redis-lock.service';
import { NatsStreamService } from '../nats/nats-stream.service';
import { NatsRoomService } from '../nats/nats-room.service';
import { WebhookNotifierService } from '../webhook/webhook-notifier.service';
import { RoomInfoService } from './room-info.service';
import { acquireRoomCreationLockWithRetry } from './room-lock.helper';

/**
 * RoomCreateService handles the creation of new rooms
 */
@Injectable()
export class RoomCreateService {
    private readonly logger = new Logger(RoomCreateService.name);


    constructor(
        private readonly configService: ConfigService,
        private readonly redisLock: RedisLockService,
        private readonly natsStream: NatsStreamService,
        private readonly natsRoom: NatsRoomService,
        private readonly webhookNotifier: WebhookNotifierService,
        private readonly roomInfoService: RoomInfoService,
        // TODO: Inject file service when implemented
        // private readonly fileService: FileService,
    ) { }

    /**
     * CreateRoom creates a new room
     */
    async createRoom(req: CreateRoomReq): Promise<ActiveRoomInfo> {
        const log = this.logger;
        log.log(`Create room request: ${req.roomId}, breakout: ${req.metadata?.isBreakoutRoom}`);

        // Step 1: Acquire room creation lock (prevent duplicate creation)
        // Using helper with retry and exponential backoff
        const lockValue = await acquireRoomCreationLockWithRetry(this.redisLock, req.roomId, this.logger);

        try {
            // Step 2: Check if room already exists in DB
            // Using RoomInfoService which matches source DatabaseService
            let roomDbInfo = await this.roomInfoService.getRoomInfoByRoomId(req.roomId, true);

            // Step 3: Handle existing room logic
            if (roomDbInfo && roomDbInfo.sid) {
                log.log(`Found existing active room in DB: ${req.roomId}`);
                const existingRoom = await this.handleExistingRoom(req, roomDbInfo);
                if (existingRoom) {
                    log.log(`Successfully handled existing room: ${req.roomId}`);
                    return existingRoom;
                }
                log.log(`Existing room was stale, proceeding to create new session`);
            }

            // Step 4: Initialize room defaults
            this.setRoomDefaults(req);

            // Step 5: Prepare DB model
            const { roomInfo, sid } = this.prepareRoomDbInfo(req, roomDbInfo);

            // Step 6: Save to database using atomic upsert
            await this.roomInfoService.insertOrUpdateRoomInfo({
                id: roomInfo.id,
                roomTitle: roomInfo.roomTitle,
                roomId: roomInfo.roomId,
                sid: roomInfo.sid,
                joinedParticipants: roomInfo.joinedParticipants,
                isRunning: roomInfo.isRunning,
                webhookUrl: roomInfo.webhookUrl,
                isBreakoutRoom: roomInfo.isBreakoutRoom ? true : false,
                parentRoomId: roomInfo.parentRoomId,
                creationTime: BigInt(roomInfo.creationTime),
            });


            // Re-fetch to get the auto-increment ID if it was a new insert
            const savedRoomInfo = await this.roomInfoService.getRoomInfoByRoomId(req.roomId, true);
            if (!savedRoomInfo) {
                throw new Error('Failed to retrieve saved room info');
            }
            log.log(`Room info saved to DB: ${req.roomId}, sid: ${sid}, webhook: ${savedRoomInfo.webhookUrl}`);

            // Step 7: Create room in NATS bucket
            // Use savedRoomInfo.id to ensure we have the DB auto-increment ID
            await this.natsRoom.addRoom(savedRoomInfo.id, req.roomId, sid, req.emptyTimeout, req.maxParticipants, req.metadata);
            log.log(`Room added to NATS: ${req.roomId}, tableId: ${savedRoomInfo.id}`);

            // Step 8: Create NATS streams
            await this.natsStream.createRoomNatsStreams(req.roomId);
            log.log(`NATS streams created: ${req.roomId}`);

            // Step 9: Get room info from NATS
            const rInfo = await this.natsRoom.getRoomInfo(req.roomId);
            if (!rInfo) {
                throw new Error('Room not found in KV');
            }

            // Step 10: Preload whiteboard file if needed (async)
            if (!req.metadata?.isBreakoutRoom) {
                this.prepareWhiteboardPreloadFile(req.metadata!, req.roomId, sid).catch((err) => {
                    log.error(`Failed to prepare whiteboard preload file: ${err.message}`);
                });
            }

            // Step 11: Build response
            const activeRoomInfo = create(ActiveRoomInfoSchema, {
                roomId: rInfo.roomId,
                sid: rInfo.roomSid,
                roomTitle: roomInfo.roomTitle,
                isRunning: 1,
                creationTime: roomInfo.creationTime.toString(),
                webhookUrl: roomInfo.webhookUrl,
                metadata: rInfo.metadata,
            });

            // Step 12: Send room created webhook (async)
            this.sendRoomCreatedWebhook(activeRoomInfo, req.emptyTimeout, req.maxParticipants).catch((err) => {
                log.error(`Failed to send room created webhook: ${err.message}`);
            });

            log.log(`Successfully created new room: ${req.roomId}`);
            return activeRoomInfo;
        } finally {
            // Always release lock
            const timeoutPromise = new Promise<void>((_, reject) => {
                setTimeout(() => reject(new Error('Unlock timeout after 5 seconds')), 5000);
            });

            const unlockPromise = this.redisLock.unlockRoomCreation(req.roomId, lockValue);

            try {
                await Promise.race([unlockPromise, timeoutPromise]);
                log.log(`Room creation lock released: ${req.roomId}`);
            } catch (unlockErr) {
                // Swallow unlock errors, only log 
                log.error(
                    `Error trying to clean up room creation lock for ${req.roomId}: ${unlockErr instanceof Error ? unlockErr.message : unlockErr}`,
                );
            }
        }
    }

    /**
     * handleExistingRoom handles logic if room already exists

     */
    private async handleExistingRoom(
        req: CreateRoomReq,
        roomDbInfo: any,
    ): Promise<ActiveRoomInfo | null> {
        this.logger.log(`Checking NATS for live room info: ${req.roomId}`);

        // Get room info from NATS
        const rInfo = await this.natsRoom.getRoomInfo(req.roomId);

        if (!rInfo) {
            this.logger.log(`No active room found in NATS, proceeding to create new session`);
            return null;
        }

        // Check if NATS room matches DB record
        // NOTE: dbTableId from NATS is a string (uint64), roomDbInfo.id is a number
        // We must convert for proper comparison
        const natsDbId = parseInt(rInfo.dbTableId, 10);
        if (natsDbId !== roomDbInfo.id) {
            this.logger.warn(
                `NATS room info does not match DB record (nats_id: ${natsDbId}, db_id: ${roomDbInfo.id}), proceeding to create new session`,
            );
            return null;
        }

        // Room is active and matches DB record
        this.logger.log(`Found matching active room in NATS, ensuring streams are active`);

        // Ensure NATS streams are active
        await this.natsStream.createRoomNatsStreams(req.roomId);
        await this.natsRoom.updateRoomStatus(req.roomId, 'active');

        return create(ActiveRoomInfoSchema, {
            roomId: rInfo.roomId,
            sid: rInfo.roomSid,
            roomTitle: roomDbInfo.roomTitle,
            isRunning: 1,
            creationTime: roomDbInfo.creationTime.toString(),
            webhookUrl: roomDbInfo.webhookUrl,
            metadata: rInfo.metadata,
        });
    }

    /**
     * setRoomDefaults sets default values and metadata

     */
    private setRoomDefaults(req: CreateRoomReq): void {
        // Apply default room features
        prepareDefaultRoomFeatures(req);

        // Get upload settings from config
        const maxFileSize = this.configService.get<number>('UPLOAD_MAX_FILE_SIZE') || 50 * 1024 * 1024;
        const maxWhiteboardFile = this.configService.get<number>('UPLOAD_MAX_WHITEBOARD_FILE') || 10 * 1024 * 1024;
        const allowedTypes = this.configService.get<string>('UPLOAD_ALLOWED_TYPES')?.split(',') || [];
        const sharedNotePadEnabled = this.configService.get<boolean>('SHARED_NOTEPAD_ENABLED') || true;

        // Convert numbers to strings for uint64 compatibility 
        setCreateRoomDefaultValues(
            req,
            maxFileSize.toString(),  // uint64 with JS_STRING = string
            maxWhiteboardFile.toString(),  // uint64 with JS_STRING = string
            allowedTypes,
            sharedNotePadEnabled
        );
        setRoomDefaultLockSettings(req);

        // Get room default settings from config 
        const roomDefaults: RoomDefaultSettings = {
            maxParticipants: this.configService.get<number>('ROOM_DEFAULT_MAX_PARTICIPANTS'),
            maxDuration: this.configService.get<string>('ROOM_DEFAULT_MAX_DURATION'),
            maxNumBreakoutRooms: this.configService.get<number>('ROOM_DEFAULT_MAX_NUM_BREAKOUT_ROOMS'),
        };
        setDefaultRoomSettings(roomDefaults, req);

        // Copyright configuration
        const copyrightDisplay = this.configService.get<boolean>('COPYRIGHT_DISPLAY') !== false;
        const copyrightText = this.configService.get<string>('COPYRIGHT_TEXT') || 'Developed by MiraiMagicLab';
        const copyrightAllowOverride = this.configService.get<boolean>('COPYRIGHT_ALLOW_OVERRIDE') || false;

        const defaultCopyright = create(CopyrightConfSchema, {
            display: copyrightDisplay,
            text: copyrightText,
        });

        if (req.metadata?.copyrightConf && !copyrightAllowOverride) {
            req.metadata.copyrightConf = defaultCopyright;
        } else if (!req.metadata?.copyrightConf) {
            if (!req.metadata) {
                req.metadata = {} as RoomMetadata;
            }
            req.metadata.copyrightConf = defaultCopyright;
        }

        // Disable analytics for breakout rooms
        if (req.metadata?.isBreakoutRoom && req.metadata?.roomFeatures?.enableAnalytics) {
            req.metadata.roomFeatures.enableAnalytics = false;
        }

        // Insights features configuration
        if (req.metadata?.roomFeatures?.insightsFeatures) {
            const insightsEnabled = this.configService.get<boolean>('INSIGHTS_ENABLED') || false;
            if (!insightsEnabled) {
                req.metadata.roomFeatures.insightsFeatures.isAllow = false;
            } else {
                // Set max selected translation languages
                const maxTranscriptionLangs = this.configService.get<number>('INSIGHTS_MAX_TRANSCRIPTION_LANGS') || 2;
                const maxChatTransLangs = this.configService.get<number>('INSIGHTS_MAX_CHAT_TRANS_LANGS') || 5;

                if (req.metadata.roomFeatures.insightsFeatures.transcriptionFeatures) {
                    req.metadata.roomFeatures.insightsFeatures.transcriptionFeatures.maxSelectedTransLangs = maxTranscriptionLangs;
                }
                if (req.metadata.roomFeatures.insightsFeatures.chatTranslationFeatures) {
                    req.metadata.roomFeatures.insightsFeatures.chatTranslationFeatures.maxSelectedTransLangs = maxChatTransLangs;
                }
            }
        }

        // Azure cognitive services (deprecated)
        const azureEnabled = this.configService.get<boolean>('AZURE_SPEECH_ENABLED') || false;
        if (!azureEnabled) {
            if (req.metadata?.roomFeatures?.speechToTextTranslationFeatures) {
                req.metadata.roomFeatures.speechToTextTranslationFeatures.isAllow = false;
            }
        } else {
            const maxTransLangs = this.configService.get<number>('AZURE_SPEECH_MAX_TRANS_LANGS') || 2;
            if (req.metadata?.roomFeatures?.speechToTextTranslationFeatures) {
                req.metadata.roomFeatures.speechToTextTranslationFeatures.maxNumTranLangsAllowSelecting = maxTransLangs;
            }
        }
    }

    /**
     * prepareRoomDbInfo prepares DB model for room

     */
    private prepareRoomDbInfo(req: CreateRoomReq, existing: any | null): { roomInfo: any; sid: string } {
        const sid = uuidv4();
        const isBreakoutRoom = req.metadata?.isBreakoutRoom ? 1 : 0;

        if (!existing) {
            existing = {
                roomTitle: req.metadata?.roomTitle || '',
                roomId: req.roomId,
                sid: sid,
                joinedParticipants: 0,
                isRunning: 1,
                webhookUrl: '',
                isBreakoutRoom: isBreakoutRoom,
                parentRoomId: req.metadata?.parentRoomId || '',
                // Convert milliseconds to seconds to match server's int(10) format
                // autoCreateTime creates Unix timestamp in seconds
                creationTime: Math.floor(Date.now() / 1000),
            };
        } else {
            existing.sid = sid;
        }

        if (req.metadata?.webhookUrl) {
            existing.webhookUrl = req.metadata.webhookUrl;
        }

        return { roomInfo: existing, sid };
    }

    /**
     * prepareWhiteboardPreloadFile preloads whiteboard file

     */
    private async prepareWhiteboardPreloadFile(
        metadata: RoomMetadata,
        roomId: string,
        roomSid: string,
    ): Promise<void> {
        const wbf = metadata.roomFeatures?.whiteboardFeatures;
        if (!wbf?.isAllow || !wbf.preloadFile) {
            return;
        }

        const preloadFile = wbf.preloadFile;
        this.logger.log(`Preparing preloaded whiteboard file: ${preloadFile}`);

        try {
            // TODO: Download and process whiteboard file
            // const result = await this.fileService.downloadAndProcessPreUploadWBfile(roomId, roomSid, preloadFile);

            // Mock result for now
            const result = {
                fileId: 'wb-file-id',
                fileName: 'preloaded.pdf',
                filePath: '/path/to/file',
                totalPages: 10,
            };

            // Update metadata
            metadata.roomFeatures!.whiteboardFeatures!.preloadFile = undefined;
            metadata.roomFeatures!.whiteboardFeatures!.whiteboardFileId = result.fileId;
            metadata.roomFeatures!.whiteboardFeatures!.fileName = result.fileName;
            metadata.roomFeatures!.whiteboardFeatures!.filePath = result.filePath;
            metadata.roomFeatures!.whiteboardFeatures!.totalPages = result.totalPages;

            // Update and broadcast room metadata
            await this.natsRoom.updateRoomMetadata(roomId, metadata);

            this.logger.log(`Preloaded whiteboard file processed successfully`);
        } catch (error) {
            // Note: Error notification would be sent here via NATS in production
            // Not implemented yet as it requires additional NATS notification service
            this.logger.warn(`Preloaded whiteboard file failed, notification skipped`);
        }
    }

    /**
     * sendRoomCreatedWebhook sends room created webhook

     */
    private async sendRoomCreatedWebhook(
        info: ActiveRoomInfo,
        emptyTimeout?: number,
        maxParticipants?: number,
    ): Promise<void> {
        // Register webhook for this room
        await this.webhookNotifier.registerWebhook(info.roomId, info.sid);

        const event = 'room_created';
        const creationTime = BigInt(info.creationTime);

        const msg = create(CommonNotifyEventSchema, {
            event: event,
            room: create(NotifyEventRoomSchema, {
                roomId: info.roomId,
                sid: info.sid,
                creationTime: creationTime.toString(), // uint64 as string
                metadata: info.metadata,
                emptyTimeout: emptyTimeout,
                maxParticipants: maxParticipants,
            }),
        });

        try {
            // Send webhook event
            await this.webhookNotifier.sendWebhookEvent(msg);
            this.logger.log(`Room created webhook sent: ${info.roomId}`);
        } catch (error) {
            this.logger.error(`Error sending room created webhook: ${error instanceof Error ? error.message : error}`);
        }
    }

    // ============================================================================
    // Database methods have been moved to RoomInfoService
    // - getRoomInfoByRoomId: Use roomInfoService.getRoomInfoByRoomId()
    // - insertOrUpdateRoomInfo: Use roomInfoService.insertOrUpdateRoomInfo()
    // ============================================================================
}
