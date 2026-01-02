
import {
    Controller,
    Post,
    Body,
    Req,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { fromBinary, create } from '@bufbuild/protobuf';
import {
    GenerateTokenReq,
    GenerateTokenReqSchema,
    GenerateTokenRes,
    GenerateTokenResSchema,
    UpdateUserLockSettingsReq,
    UpdateUserLockSettingsReqSchema,
    MuteUnMuteTrackReq,
    MuteUnMuteTrackReqSchema,
    RemoveParticipantReq,
    RemoveParticipantReqSchema,
    SwitchPresenterReq,
    SwitchPresenterReqSchema,
    VerifyTokenReq,
    VerifyTokenReqSchema,
    IsRoomActiveReqSchema,
    VerifyTokenResSchema,
    NatsSubjectsSchema,
} from '@workspace/protocol';
import {
    sendCommonProtoJsonResponse,
    sendProtoJsonResponse,
    sendCommonProtobufResponse,
    parseAndValidateRequest,
    ApiKeyGuard,
    JwtAuthGuard,
    sendProtobufResponse,
} from '@server/shared';
import { ConfigService } from "@nestjs/config";
import { RoomUserService } from '../../modules/room/room-user.service';
import { RoomInfoService } from '../../modules/room/room-info.service';

/**
 * UserRoomSettingController handles user operations within rooms (JwtAuthGuard routes)
 * Routes under /api
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class UserRoomSettingController {
    constructor(
        private readonly roomUserService: RoomUserService,
        private readonly roomInfoService: RoomInfoService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * HandleVerifyToken verifies a user's token before they join a room
     *
     * @route POST /api/verifyToken
     */
    @Post('verifyToken')
    @HttpCode(HttpStatus.OK)
    async handleVerifyToken(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        // Get locals set by JwtAuthGuard
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        // Parse protobuf request
        let request: VerifyTokenReq;
        try {
            request = fromBinary(VerifyTokenReqSchema, bodyBuffer);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        // Check for duplicate join
        try {
            const userStatus = await this.roomUserService.getUserStatus(roomId, requestedUserId);

            if (userStatus === 'online') {
                sendCommonProtoJsonResponse(res, false, 'notifications.room-disconnected-duplicate-entry');
                return;
            }
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error checking user status');
            return;
        }

        // Check if user is in block list
        try {
            const isBlocked = await this.roomUserService.isUserInBlockList(roomId, requestedUserId);

            if (isBlocked) {
                sendCommonProtoJsonResponse(res, false, 'notifications.you-are-blocked');
                return;
            }
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error checking block list');
            return;
        }

        // Check if room is active
        try {
            const isRoomActiveReq = create(IsRoomActiveReqSchema, { roomId });
            const roomActiveResponse = await this.roomInfoService.isRoomActive(isRoomActiveReq);

            if (!roomActiveResponse) {
                sendCommonProtoJsonResponse(res, false, 'room status unavailable');
                return;
            }

            const rr = roomActiveResponse.res;
            const rInfo = roomActiveResponse.rInfo;
            const roomDbInfo = roomActiveResponse.roomDbInfo;
            const meta = roomActiveResponse.meta ?? roomActiveResponse.metadata;

            if (!rr?.isActive) {
                sendCommonProtoJsonResponse(res, false, rr?.msg || 'room is not active');
                return;
            }

            // Check max participants
            if (
                Number(rInfo?.maxParticipants || 0) > 0 &&
                (roomDbInfo?.joinedParticipants || 0) >= Number(rInfo?.maxParticipants || 0)
            ) {
                sendCommonProtoJsonResponse(res, false, 'notifications.max-num-participates-exceeded');
                return;
            }

            // Build successful response
            const rawWsUrls = this.configService.get<string>('NATS_WS_URLS') || 'ws://localhost:8222';
            const natsWsUrls = rawWsUrls
                ? rawWsUrls.split(',').map((u) => u.trim()).filter((u) => !!u)
                : this.configService.get<string[]>('NATS_WS_URLS') || [];
            const version = '1.0.0';

            // Read NATS subjects from config
            const natsSubjects = {
                systemApiWorker: this.configService.get<string>('NATS_SUBJECT_SYSTEM_API_WORKER') || 'sysApiWorker',
                systemJsWorker: this.configService.get<string>('NATS_SUBJECT_SYSTEM_JS_WORKER') || 'sysJsWorker',
                systemPublic: this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC') || 'sysPublic',
                systemPrivate: this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE') || 'sysPrivate',
                chat: this.configService.get<string>('NATS_SUBJECT_CHAT') || 'chat',
                whiteboard: this.configService.get<string>('NATS_SUBJECT_WHITEBOARD') || 'whiteboard',
                dataChannel: this.configService.get<string>('NATS_SUBJECT_DATA_CHANNEL') || 'dataChannel',
            };

            const response = create(VerifyTokenResSchema, {
                status: true,
                msg: 'token is valid',
                natsWsUrls: natsWsUrls,
                serverVersion: version,
                roomId: roomId,
                userId: requestedUserId,
                natsSubjects: create(NatsSubjectsSchema, natsSubjects),
                enabledSelfInsertEncryptionKey:
                    meta?.roomFeatures?.endToEndEncryptionFeatures?.enabledSelfInsertEncryptionKey || false,
            });

            sendProtobufResponse(res, VerifyTokenResSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error verifying token');
        }
    }

    /**
     * HandleUpdateUserLockSetting updates user lock settings
     *
     * @route POST /api/updateLockSettings
     */
    @Post('updateLockSettings')
    @HttpCode(HttpStatus.OK)
    async handleUpdateUserLockSetting(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        // Get locals from JwtAuthGuard
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        // Check admin permission
        if (!isAdmin) {
            sendCommonProtobufResponse(res, false, 'only admin can perform this task');
            return;
        }

        // Parse protobuf request
        let request: UpdateUserLockSettingsReq;
        try {
            request = fromBinary(UpdateUserLockSettingsReqSchema, bodyBuffer);
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        // Validate room ID matches token
        if (roomId !== request.roomId) {
            sendCommonProtobufResponse(res, false, 'requested roomId & token roomId mismatched');
            return;
        }

        // Check if room is running
        try {
            const room = await this.roomInfoService.getRoomInfoBySid(request.roomSid, 1);

            if (!room || !room.id) {
                sendCommonProtobufResponse(res, false, 'room isn\'t running');
                return;
            }
        } catch (error) {
            sendCommonProtobufResponse(res, false, 'room isn\'t running');
            return;
        }

        // Call service directly
        try {
            await this.roomUserService.updateUserLockSettings({
                roomId: request.roomId,
                userId: request.userId,
                service: request.service,
                direction: request.direction as 'lock' | 'unlock',
                requestedUserId,
            });

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error updating lock settings');
        }
    }

    /**
     * HandleMuteUnMuteTrack mutes or unmutes a user's track
     *
     * @route POST /api/muteUnMuteTrack
     */
    @Post('muteUnmuteTrack')
    @HttpCode(HttpStatus.OK)
    async handleMuteUnMuteTrack(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        // Get locals from JwtAuthGuard
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        // Check admin permission
        if (!isAdmin) {
            sendCommonProtobufResponse(res, false, 'only admin can perform this task');
            return;
        }

        // Parse protobuf request
        let request: MuteUnMuteTrackReq;
        try {
            request = fromBinary(MuteUnMuteTrackReqSchema, bodyBuffer);
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        // Validate room ID matches token
        if (roomId !== request.roomId) {
            sendCommonProtobufResponse(res, false, 'requested roomId & token roomId mismatched');
            return;
        }

        // Check if room is running
        try {
            const room = await this.roomInfoService.getRoomInfoBySid(request.sid, 1);

            if (!room || !room.id) {
                sendCommonProtobufResponse(res, false, 'room isn\'t running');
                return;
            }
        } catch (error) {
            sendCommonProtobufResponse(res, false, 'room isn\'t running');
            return;
        }

        // Call service directly
        try {
            await this.roomUserService.handleMuteUnMuteTrack({
                roomId: request.roomId,
                userId: request.userId,
                trackSid: request.trackSid,
                muted: request.muted,
                requestedUserId,
            });

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error muting/unmuting track');
        }
    }

    /**
     * HandleRemoveParticipant removes a participant from a room
     *
     * @route POST /api/removeParticipant
     */
    @Post('removeParticipant')
    @HttpCode(HttpStatus.OK)
    async handleRemoveParticipant(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        // Get locals from JwtAuthGuard
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        // Check admin permission
        if (!isAdmin) {
            sendCommonProtobufResponse(res, false, 'only admin can perform this task');
            return;
        }

        // Parse protobuf request
        let request: RemoveParticipantReq;
        try {
            request = fromBinary(RemoveParticipantReqSchema, bodyBuffer);
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        // Validate room ID matches token
        if (roomId !== request.roomId) {
            sendCommonProtobufResponse(res, false, 'requested roomId & token roomId mismatched');
            return;
        }

        // Validate user can't remove themselves
        if (requestedUserId === request.userId) {
            sendCommonProtobufResponse(res, false, 'you can\'t remove yourself');
            return;
        }

        // Check if room is running
        try {
            const room = await this.roomInfoService.getRoomInfoBySid(request.sid, 1);

            if (!room || !room.id) {
                sendCommonProtobufResponse(res, false, 'room isn\'t running');
                return;
            }
        } catch (error) {
            sendCommonProtobufResponse(res, false, 'room isn\'t running');
            return;
        }

        // Call service directly
        try {
            await this.roomUserService.handleRemoveParticipant({
                sid: request.sid,
                roomId: request.roomId,
                userId: request.userId,
                msg: request.msg,
                blockUser: request.blockUser,
            });

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error removing participant');
        }
    }

    /**
     * HandleSwitchPresenter switches the presenter in a room
     *
     * @route POST /api/switchPresenter
     */
    @Post('switchPresenter')
    @HttpCode(HttpStatus.OK)
    async handleSwitchPresenter(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        // Get locals from JwtAuthGuard
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        // Check admin permission
        if (!isAdmin) {
            sendCommonProtobufResponse(res, false, 'only admin can perform this task');
            return;
        }

        // Parse protobuf request
        let request: SwitchPresenterReq;
        try {
            request = fromBinary(SwitchPresenterReqSchema, bodyBuffer);
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        // Call service directly
        try {
            // Note: switchPresenter is private, use handleSwitchPresenter instead
            await this.roomUserService.handleSwitchPresenter({
                roomId,
                userId: request.userId,
                requestedUserId,
                task: request.task,
            });

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error switching presenter');
        }
    }
}