/**
 * Gateway Controller
 * Equivalent to Go: plugNmeet-server/pkg/controllers/auth.go (route handlers only)
 * 
 * Note: Middleware methods moved to Guards:
 * - HandleAuthHeaderCheck → ApiKeyGuard
 * - HandleVerifyHeaderToken → JwtAuthGuard
 */

import {
  Controller,
  Post,
  Headers,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import {
  VerifyTokenReq,
  VerifyTokenReqSchema,
  VerifyTokenRes,
  VerifyTokenResSchema,
  IsRoomActiveReq,
  IsRoomActiveReqSchema,
  NatsSubjectsSchema,
  PlugNmeetTokenClaims,
} from '@workspace/protocol';
import { ConfigService } from '@nestjs/config';
import { sendProtobufResponse, sendCommonProtoJsonResponse, JwtAuthGuard } from '@server/shared';

/**
 * GatewayController handles /api routes
 * All routes protected by JwtAuthGuard (HandleVerifyHeaderToken equivalent)
 */
@Controller('api')
@UseGuards(JwtAuthGuard)
export class GatewayController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly configService: ConfigService,
  ) { }

  /**
   * HandleVerifyToken verifies a user's token before they join a room
   * Equivalent to Go: ac.HandleVerifyToken
   * 
   * @route POST /api/verifyToken
   */
  @Post('verifyToken')
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
      const userStatus = await this.natsClient
        .send('room.getUserStatus', { roomId, userId: requestedUserId })
        .toPromise();

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
      const isBlocked = await this.natsClient
        .send('room.isUserInBlockList', { roomId, userId: requestedUserId })
        .toPromise();

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
      const roomActiveResponse = await this.natsClient
        .send('room.isActive', toBinary(IsRoomActiveReqSchema, isRoomActiveReq))
        .toPromise();

      const roomData = roomActiveResponse; // Contains: rr, roomDbInfo, rInfo, meta

      if (!roomData.isActive) {
        sendCommonProtoJsonResponse(res, false, roomData.msg);
        return;
      }

      // Check max participants
      if (
        roomData.rInfo.maxParticipants > 0 &&
        roomData.roomDbInfo.joinedParticipants >= roomData.rInfo.maxParticipants
      ) {
        sendCommonProtoJsonResponse(res, false, 'notifications.max-num-participates-exceeded');
        return;
      }

      // Build successful response
      const natsWsUrls = this.configService.get<string[]>('NATS_WS_URLS') || [];
      const version = '1.0.0';

      // Read NATS subjects from config (matching Go: ac.AppConfig.NatsInfo.Subjects)
      const natsSubjects = {
        systemApiWorker: this.configService.get<string>('NATS_SUBJECT_SYSTEM_API_WORKER') || 'sysApiWorker',
        systemJsWorker: this.configService.get<string>('NATS_SUBJECT_SYSTEM_JS_WORKER') || 'sysJsWorker',
        systemPublic: this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC') || 'sysPublic',
        systemPrivate: this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE') || 'sysPrivate',
        chat: this.configService.get<string>('NATS_SUBJECT_CHAT') || 'chat',
        whiteboard: this.configService.get<string>('NATS_SUBJECT_WHITEBOARD') || 'whiteboard',
        dataChannel: this.configService.get<string>('NATS_SUBJECT_DATA_CHANNEL') || 'datachannel',
      };

      const response = create(VerifyTokenResSchema, {
        status: true,
        msg: 'token is valid',
        natsWsUrls: natsWsUrls,
        serverVersion: version,
        roomId: roomId,
        userId: requestedUserId,
        natsSubjects: create(NatsSubjectsSchema, natsSubjects),
        enabledSelfInsertEncryptionKey: roomData.meta?.roomFeatures?.endToEndEncryptionFeatures?.enabledSelfInsertEncryptionKey || false,
      });

      sendProtobufResponse(res, response, VerifyTokenResSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error verifying token');
    }
  }
}
