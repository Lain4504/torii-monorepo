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
    parseAndValidateRequest,
    ApiKeyGuard,
} from '@server/shared';
import { RoomUserService } from '../../modules/room/room-user.service';
import { RoomInfoService } from '../../modules/room/room-info.service';

/**
 * AuthRoomController handles user operations within rooms (ApiKeyGuard routes)
 * Routes under /auth/room
 */
@Controller('auth/room')
@UseGuards(ApiKeyGuard)
export class AuthRoomController {
    constructor(
        private readonly roomUserService: RoomUserService,
        private readonly roomInfoService: RoomInfoService,
    ) { }

    /**
     * HandleGenerateJoinToken generates a join token for a user
     *
     * @route POST /auth/room/getJoinToken
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

        // Check if user is blocked
        try {
            const isBlocked = await this.roomUserService.isUserInBlockList(request.roomId, request.userInfo.userId);

            if (isBlocked) {
                sendCommonProtoJsonResponse(res, false, 'this user is blocked to join this session');
                return;
            }
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error checking block list');
            return;
        }

        // Check if room is active
        try {
            const roomInfo = await this.roomInfoService.getRoomInfoByRoomId(request.roomId, true);

            if (!roomInfo || !roomInfo.id) {
                sendCommonProtoJsonResponse(res, false, 'room is not active. create room first');
                return;
            }
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, 'room is not active. create room first');
            return;
        }

        // Generate token
        try {
            const result = await this.roomUserService.getWajlcJoinToken(request);

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


