/**
 * User Room Setting Controller (Gateway)
 *
 * Handles user operations within rooms via Gateway -> NATS -> Meet Service
 * Routes under /api (with JwtAuthGuard)
 */

import {
    Controller,
    Post,
    Body,
    Req,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { fromBinary, create } from '@bufbuild/protobuf';
import {
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
    sendCommonProtobufResponse,
    JwtAuthGuard,
    sendProtobufResponse,
} from '@server/shared';
import { ConfigService } from '@nestjs/config';

/**
 * UserRoomSettingController handles user operations within rooms (JwtAuthGuard routes)
 * Routes under /api
 */
@Controller('api')
@UseGuards(JwtAuthGuard)
export class UserRoomSettingController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
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
            sendCommonProtoJsonResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Invalid request',
            );
            return;
        }

        // Check for duplicate join
        try {
            const userStatus = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'user.getUserStatus' },
                    {
                        roomId,
                        userId: requestedUserId,
                    },
                ),
            );

            if (userStatus === 'online') {
                sendCommonProtoJsonResponse(
                    res,
                    false,
                    'notifications.room-disconnected-duplicate-entry',
                );
                return;
            }
        } catch (error) {
            sendCommonProtoJsonResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Error checking user status',
            );
            return;
        }

        // Check if user is in block list
        try {
            const isBlocked = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'user.isUserInBlockList' },
                    { roomId, userId: requestedUserId },
                ),
            );

            if (isBlocked) {
                sendCommonProtoJsonResponse(
                    res,
                    false,
                    'notifications.you-are-blocked',
                );
                return;
            }
        } catch (error) {
            sendCommonProtoJsonResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Error checking block list',
            );
            return;
        }

        // Check if room is active
        try {
            const isRoomActiveReq = create(IsRoomActiveReqSchema, { roomId });
            // Send plain object to NATS - NestJS handles JSON serialization
            const roomActiveResponse = await firstValueFrom(
                this.natsClient.send({ cmd: 'room.isActive' }, isRoomActiveReq),
            );

            if (!roomActiveResponse) {
                sendCommonProtoJsonResponse(res, false, 'room status unavailable');
                return;
            }

            // roomActiveResponse can be either IsRoomActiveRes or full payload { res, roomDbInfo, rInfo, meta }
            const roomData = roomActiveResponse?.res
                ? roomActiveResponse
                : { res: roomActiveResponse };
            const rr = roomData.res;
            const rInfo = roomData.rInfo;
            const roomDbInfo = roomData.roomDbInfo;
            const meta = roomData.meta ?? roomData.metadata;

            if (!rr?.isActive) {
                sendCommonProtoJsonResponse(
                    res,
                    false,
                    rr?.msg || 'room is not active',
                );
                return;
            }

            // Check max participants
            if (
                (rInfo?.maxParticipants || 0) > 0 &&
                (roomDbInfo?.joinedParticipants || 0) >=
                (rInfo?.maxParticipants || 0)
            ) {
                sendCommonProtoJsonResponse(
                    res,
                    false,
                    'notifications.max-num-participates-exceeded',
                );
                return;
            }

            // Build successful response
            // Accept env as comma-separated string or array
            const rawWsUrls = this.configService.get<string>('NATS_WS_URLS');
            const natsWsUrls = rawWsUrls
                ? rawWsUrls
                    .split(',')
                    .map((u) => u.trim())
                    .filter((u) => !!u)
                : this.configService.get<string[]>('NATS_WS_URLS') || [];
            const version = '1.0.0';

            // Read NATS subjects from config
            const natsSubjects = {
                systemApiWorker:
                    this.configService.get<string>('NATS_SUBJECT_SYSTEM_API_WORKER') ||
                    'sysApiWorker',
                systemJsWorker:
                    this.configService.get<string>('NATS_SUBJECT_SYSTEM_JS_WORKER') ||
                    'sysJsWorker',
                systemPublic:
                    this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC') ||
                    'sysPublic',
                systemPrivate:
                    this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE') ||
                    'sysPrivate',
                chat: this.configService.get<string>('NATS_SUBJECT_CHAT') || 'chat',
                whiteboard:
                    this.configService.get<string>('NATS_SUBJECT_WHITEBOARD') ||
                    'whiteboard',
                dataChannel:
                    this.configService.get<string>('NATS_SUBJECT_DATA_CHANNEL') ||
                    'dataChannel',
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
                    meta?.roomFeatures?.endToEndEncryptionFeatures
                        ?.enabledSelfInsertEncryptionKey || false,
            });

            // Keep parameter order consistent with sendProtobufResponse(res, schema, message)
            sendProtobufResponse(res, VerifyTokenResSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Error verifying token',
            );
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
            sendCommonProtobufResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Invalid request',
            );
            return;
        }

        // Validate room ID matches token
        if (roomId !== request.roomId) {
            sendCommonProtobufResponse(
                res,
                false,
                'requested roomId & token roomId mismatched',
            );
            return;
        }

        // Check if room is running (via NATS)
        try {
            const room = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'room.getRoomInfoBySid' },
                    { sid: request.roomSid, isRunning: 1 },
                ),
            );

            if (!room || !room.id) {
                sendCommonProtobufResponse(res, false, "room isn't running");
                return;
            }
        } catch (error) {
            sendCommonProtobufResponse(res, false, "room isn't running");
            return;
        }

        // Add requestedUserId to request
        request.requestedUserId = requestedUserId;

        // Call user service via NATS
        try {
            await firstValueFrom(
                this.natsClient.send({ cmd: 'user.updateLockSettings' }, request),
            );

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(
                res,
                false,
                error instanceof Error
                    ? error.message
                    : 'Error updating lock settings',
            );
        }
    }

    /**
     * HandleMuteUnMuteTrack mutes or unmutes a user's track
     *
     * @route POST /api/muteUnMuteTrack
     */
    @Post('muteUnMuteTrack')
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
            sendCommonProtobufResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Invalid request',
            );
            return;
        }

        // Validate room ID matches token
        if (roomId !== request.roomId) {
            sendCommonProtobufResponse(
                res,
                false,
                'requested roomId & token roomId mismatched',
            );
            return;
        }

        // Check if room is running (via NATS)
        try {
            const room = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'room.getRoomInfoBySid' },
                    { sid: request.sid, isRunning: 1 },
                ),
            );

            if (!room || !room.id) {
                sendCommonProtobufResponse(res, false, "room isn't running");
                return;
            }
        } catch (error) {
            sendCommonProtobufResponse(res, false, "room isn't running");
            return;
        }

        // Add requestedUserId to request
        request.requestedUserId = requestedUserId;

        // Call user service via NATS
        try {
            await firstValueFrom(
                this.natsClient.send({ cmd: 'user.muteUnMuteTrack' }, request),
            );

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(
                res,
                false,
                error instanceof Error
                    ? error.message
                    : 'Error muting/unmuting track',
            );
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
            sendCommonProtobufResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Invalid request',
            );
            return;
        }

        // Validate room ID matches token
        if (roomId !== request.roomId) {
            sendCommonProtobufResponse(
                res,
                false,
                'requested roomId & token roomId mismatched',
            );
            return;
        }

        // Validate user can't remove themselves
        if (requestedUserId === request.userId) {
            sendCommonProtobufResponse(res, false, "you can't remove yourself");
            return;
        }

        // Check if room is running (via NATS)
        try {
            const room = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'room.getRoomInfoBySid' },
                    { sid: request.sid, isRunning: 1 },
                ),
            );

            if (!room || !room.id) {
                sendCommonProtobufResponse(res, false, "room isn't running");
                return;
            }
        } catch (error) {
            sendCommonProtobufResponse(res, false, "room isn't running");
            return;
        }

        // Call user service via NATS
        try {
            await firstValueFrom(
                this.natsClient.send({ cmd: 'user.removeParticipant' }, request),
            );

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Error removing participant',
            );
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
            sendCommonProtobufResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Invalid request',
            );
            return;
        }

        // Set roomId and requestedUserId from token (matches proto field names)
        request.roomId = roomId;
        request.requestedUserId = requestedUserId;

        // Call user service via NATS
        try {
            await firstValueFrom(
                this.natsClient.send({ cmd: 'user.switchPresenter' }, request),
            );

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(
                res,
                false,
                error instanceof Error ? error.message : 'Error switching presenter',
            );
        }
    }
}
