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
    SwitchPresenterReqSchema, VerifyTokenReq, VerifyTokenReqSchema, IsRoomActiveReqSchema, VerifyTokenResSchema,
    NatsSubjectsSchema,
} from '@workspace/protocol';
import {
    sendCommonProtoJsonResponse,
    sendProtoJsonResponse,
    sendCommonProtobufResponse,
    parseAndValidateRequest,
    ApiKeyGuard,
    JwtAuthGuard, sendProtobufResponse,
} from '@server/shared';
import {ConfigService} from "@nestjs/config";

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


