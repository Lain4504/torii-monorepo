/**
 * Auth Room Controller (User Controller for Room Features)
 *
 * Handles user/participant operations within rooms (not authentication/login)
 * - Generate join tokens
 * - Update user lock settings
 * - Mute/unmute tracks
 * - Remove participants
 * - Switch presenter
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
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
} from '@workspace/protocol';
import {
    sendCommonProtoJsonResponse,
    sendProtoJsonResponse,
    sendCommonProtobufResponse,
    parseAndValidateRequest,
    ApiKeyGuard,
    JwtAuthGuard,
} from '@server/shared';

/**
 * AuthRoomController handles user operations within rooms (ApiKeyGuard routes)
 * Routes under /auth/user
 */
@Controller('auth/room')
@UseGuards(ApiKeyGuard)
export class AuthRoomController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * HandleGenerateJoinToken generates a join token for a user
     *
     * @route POST /auth/user/getJoinToken
     */
    @Post('getJoinToken')
    @HttpCode(HttpStatus.OK)
    async handleGenerateJoinToken(
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        // Parse and validate request
        let request: GenerateTokenReq;
        try {
            request = parseAndValidateRequest<GenerateTokenReq>(body, GenerateTokenReqSchema);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        // Validate userInfo
        if (!request.userInfo) {
            sendCommonProtoJsonResponse(res, false, 'UserInfo required');
            return;
        }

        // Check if user is blocked (via NATS)
        try {
            const isBlocked = await this.natsClient
                .send({ cmd: 'user.isUserInBlockList' }, { roomId: request.roomId, userId: request.userInfo.userId })
                .toPromise();

            if (isBlocked) {
                sendCommonProtoJsonResponse(res, false, 'this user is blocked to join this session');
                return;
            }
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error checking block list');
            return;
        }

        // Check if room is active (via NATS)
        try {
            const roomInfo = await this.natsClient
                .send({ cmd: 'room.getRoomInfoByRoomId' }, { roomId: request.roomId, isRunning: true })
                .toPromise();

            if (!roomInfo || !roomInfo.id) {
                sendCommonProtoJsonResponse(res, false, 'room is not active. create room first');
                return;
            }
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, 'room is not active. create room first');
            return;
        }

        // Generate token (via NATS)
        try {
            const result = await this.natsClient
                .send({ cmd: 'user.generateJoinToken' }, request)
                .toPromise();

            const response = create(GenerateTokenResSchema, {
                status: true,
                msg: 'success',
                token: result.token,
            });

            res.status(200);
            sendProtoJsonResponse(res, GenerateTokenResSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error generating token');
        }
    }
}

/**
 * UserApiController handles user operations within rooms (JwtAuthGuard routes)
 * Routes under /api
 */
@Controller('api')
@UseGuards(JwtAuthGuard)
export class UserApiController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * HandleUpdateUserLockSetting updates user lock settings
     *
     * @route POST /api/updateUserLockSettings
     */
    @Post('updateUserLockSettings')
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

        // Check if room is running (via NATS)
        try {
            const room = await this.natsClient
                .send({ cmd: 'room.getRoomInfoBySid' }, { sid: request.roomSid, isRunning: 1 })
                .toPromise();

            if (!room || !room.id) {
                sendCommonProtobufResponse(res, false, 'room isn\'t running');
                return;
            }
        } catch (error) {
            sendCommonProtobufResponse(res, false, 'room isn\'t running');
            return;
        }

        // Add requestedUserId to request
        (request as any).RequestedUserId = requestedUserId;

        // Call user service via NATS
        try {
            await this.natsClient
                .send({ cmd: 'user.updateLockSettings' }, request)
                .toPromise();

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

        // TODO: CommonValidation (via NATS if needed)

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

        // Check if room is running (via NATS)
        try {
            const room = await this.natsClient
                .send({ cmd: 'room.getRoomInfoBySid' }, { sid: request.sid, isRunning: 1 })
                .toPromise();

            if (!room || !room.id) {
                sendCommonProtobufResponse(res, false, 'room isn\'t running');
                return;
            }
        } catch (error) {
            sendCommonProtobufResponse(res, false, 'room isn\'t running');
            return;
        }

        // Add requestedUserId to request
        (request as any).RequestedUserId = requestedUserId;

        // Call user service via NATS
        try {
            await this.natsClient
                .send({ cmd: 'user.muteUnMuteTrack' }, request)
                .toPromise();

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

        // TODO: CommonValidation (via NATS if needed)

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

        // Check if room is running (via NATS)
        try {
            const room = await this.natsClient
                .send({ cmd: 'room.getRoomInfoBySid' }, { sid: request.sid, isRunning: 1 })
                .toPromise();

            if (!room || !room.id) {
                sendCommonProtobufResponse(res, false, 'room isn\'t running');
                return;
            }
        } catch (error) {
            sendCommonProtobufResponse(res, false, 'room isn\'t running');
            return;
        }

        // Call user service via NATS
        try {
            await this.natsClient
                .send({ cmd: 'user.removeParticipant' }, request)
                .toPromise();

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

        // Set roomId and requestedUserId from token
        (request as any).RoomId = roomId;
        (request as any).RequestedUserId = requestedUserId;

        // Call user service via NATS
        try {
            await this.natsClient
                .send({ cmd: 'user.switchPresenter' }, request)
                .toPromise();

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error switching presenter');
        }
    }
}
