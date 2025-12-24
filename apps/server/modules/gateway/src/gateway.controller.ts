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
  HttpStatus, HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { create, fromBinary } from '@bufbuild/protobuf';
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
        .send({ cmd: 'user.isUserInBlockList' }, { roomId, userId: requestedUserId })
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
      // Send plain object to NATS - NestJS handles JSON serialization
      const roomActiveResponse = await this.natsClient
        .send({ cmd: 'room.isActive' }, isRoomActiveReq)
        .toPromise();

      if (!roomActiveResponse) {
        sendCommonProtoJsonResponse(res, false, 'room status unavailable');
        return;
      }

      // roomActiveResponse can be either IsRoomActiveRes or full payload { res, roomDbInfo, rInfo, meta }
      const roomData = roomActiveResponse?.res ? roomActiveResponse : { res: roomActiveResponse };
      const rr = roomData.res;
      const rInfo = roomData.rInfo;
      const roomDbInfo = roomData.roomDbInfo;
      const meta = roomData.meta ?? roomData.metadata;

      if (!rr?.isActive) {
        sendCommonProtoJsonResponse(res, false, rr?.msg || 'room is not active');
        return;
      }

      // Check max participants
      if (
        (rInfo?.maxParticipants || 0) > 0 &&
        (roomDbInfo?.joinedParticipants || 0) >= (rInfo?.maxParticipants || 0)
      ) {
        sendCommonProtoJsonResponse(res, false, 'notifications.max-num-participates-exceeded');
        return;
      }

      // Build successful response
      // Accept env as comma-separated string or array to mirror Go config
      const rawWsUrls = this.configService.get<string>('NATS_WS_URLS');
      const natsWsUrls = rawWsUrls
        ? rawWsUrls.split(',').map((u) => u.trim()).filter((u) => !!u)
        : this.configService.get<string[]>('NATS_WS_URLS') || [];
      const version = '1.0.0';

      // Read NATS subjects from config (matching Go: ac.AppConfig.NatsInfo.Subjects)
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

      console.log(response);

      // Keep parameter order consistent with sendProtobufResponse(res, schema, message)
      sendProtobufResponse(res, VerifyTokenResSchema, response);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error verifying token');
    }
  }
}
