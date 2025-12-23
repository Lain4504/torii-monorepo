/**
 * Room Controller
 * Equivalent to Go: plugNmeet-server/pkg/controllers/room.go
 * 
 * Handles all room-related API endpoints
 */

import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { fromBinary, create } from '@bufbuild/protobuf';
import {
  CreateRoomReq,
  CreateRoomReqSchema,
  CreateRoomRes,
  CreateRoomResSchema,
  IsRoomActiveReq,
  IsRoomActiveReqSchema,
  IsRoomActiveRes,
  IsRoomActiveResSchema,
  GetActiveRoomInfoReq,
  GetActiveRoomInfoReqSchema,
  GetActiveRoomInfoRes,
  GetActiveRoomInfoResSchema,
  GetActiveRoomsInfoRes,
  GetActiveRoomsInfoResSchema,
  RoomEndReq,
  RoomEndReqSchema,
  FetchPastRoomsReq,
  FetchPastRoomsReqSchema,
  FetchPastRoomsRes,
  FetchPastRoomsResSchema,
  ChangeVisibilityRes,
  ChangeVisibilityResSchema,
} from '@workspace/protocol';
import {
  sendCommonProtoJsonResponse,
  sendProtoJsonResponse,
  sendCommonProtobufResponse,
  sendProtobufResponse,
  parseAndValidateRequest,  // Full Go equivalent
  ApiKeyGuard,
  JwtAuthGuard,
} from '@server/shared';

/**
 * RoomController handles room-related operations
 * Routes under /auth/room (with ApiKeyGuard)
 * Equivalent to Go: controllers.RoomController
 */
@Controller('auth/room')
@UseGuards(ApiKeyGuard)
export class RoomController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  /**
   * HandleRoomCreate handles creating a new room
   * Equivalent to Go: rc.HandleRoomCreate
   * 
   * @route POST /auth/room/create
   */
  @Post('create')
  async handleRoomCreate(
    @Body() body: any,  // Accept both JSON and binary
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request (like Go: parseAndValidateRequest)
    let request: CreateRoomReq;
    try {
      request = parseAndValidateRequest<CreateRoomReq>(body, CreateRoomReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service via NATS (plain object, not binary)
    try {
      const roomInfo = await this.natsClient
        .send({ cmd: 'room.create' }, request)
        .toPromise();

      const response = create(CreateRoomResSchema, {
        status: true,
        msg: 'success',
        roomInfo: roomInfo,
      });

      res.status(200);
      sendProtoJsonResponse(res, CreateRoomResSchema, response);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error creating room');
    }
  }

  /**
   * HandleIsRoomActive checks if a room is active
   * Equivalent to Go: rc.HandleIsRoomActive
   * 
   * @route POST /auth/room/isRoomActive
   */
  @Post('isRoomActive')
  @HttpCode(HttpStatus.OK)
  async handleIsRoomActive(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<void> {
    console.log('🔵 [Gateway] handleIsRoomActive called with body:', JSON.stringify(body));

    // Parse and validate request (like Go: parseAndValidateRequest)
    let request: IsRoomActiveReq;
    try {
      request = parseAndValidateRequest<IsRoomActiveReq>(body, IsRoomActiveReqSchema);
      console.log('🔵 [Gateway] Parsed request:', JSON.stringify(request));
    } catch (error) {
      console.error('🔴 [Gateway] Failed to parse request:', error);
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service via NATS
    // IMPORTANT: Do NOT use toBinary() - NestJS NATS transport expects plain objects
    // It will handle JSON serialization automatically
    try {
      console.log('🔵 [Gateway] Sending NATS message:', {
        pattern: 'room.isActive',
        request: request
      });

      const response = await this.natsClient
        .send({ cmd: 'room.isActive' }, request)
        .toPromise();

      console.log('🟢 [Gateway] Received NATS response:', response);
      res.status(200);
      sendProtoJsonResponse(res, IsRoomActiveResSchema, response);
    } catch (error) {
      console.error('🔴 [Gateway] NATS error:', error);
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error checking room status');
    }
  }

  /**
   * HandleGetActiveRoomInfo gets information about an active room
   * Equivalent to Go: rc.HandleGetActiveRoomInfo
   * 
   * @route POST /auth/room/getActiveRoomInfo
   */
  @Post('getActiveRoomInfo')
  @HttpCode(HttpStatus.OK)
  async handleGetActiveRoomInfo(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request (like Go: parseAndValidateRequest)
    let request: GetActiveRoomInfoReq;
    try {
      request = parseAndValidateRequest<GetActiveRoomInfoReq>(body, GetActiveRoomInfoReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service via NATS (plain object, not binary)
    try {
      const result = await this.natsClient
        .send({ cmd: 'room.getActiveInfo' }, request)
        .toPromise();

      const response = create(GetActiveRoomInfoResSchema, {
        status: result.status,
        msg: result.msg,
        room: result.room,
      });

      res.status(200);
      sendProtoJsonResponse(res, GetActiveRoomInfoResSchema, response);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting room info');
    }
  }

  /**
   * HandleGetActiveRoomsInfo gets information about all active rooms
   * Equivalent to Go: rc.HandleGetActiveRoomsInfo
   * 
   * @route POST /auth/room/getActiveRoomsInfo
   */
  @Post('getActiveRoomsInfo')
  @HttpCode(HttpStatus.OK)
  async handleGetActiveRoomsInfo(
    @Res() res: Response,
  ): Promise<void> {
    // Call room service via NATS (no request body)
    try {
      const result = await this.natsClient
        .send({ cmd: 'room.getActiveRoomsInfo' }, {})
        .toPromise();

      const response = create(GetActiveRoomsInfoResSchema, {
        status: result.status,
        msg: result.msg,
        rooms: result.rooms,
      });

      res.status(200);  // Set 200 OK
      sendProtoJsonResponse(res, GetActiveRoomsInfoResSchema, response);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting rooms info');
    }
  }

  /**
   * HandleEndRoom handles ending a room
   * Equivalent to Go: rc.HandleEndRoom
   * internal / trusted
   * @route POST /auth/room/endRoom
   */
  @Post('endRoom')
  @HttpCode(HttpStatus.OK)
  async handleEndRoom(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request (like Go: parseAndValidateRequest)
    let request: RoomEndReq;
    try {
      request = parseAndValidateRequest<RoomEndReq>(body, RoomEndReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service via NATS (plain object, not binary)
    try {
      const result = await this.natsClient
        .send({ cmd: 'room.end' }, request)
        .toPromise();

      sendCommonProtoJsonResponse(res, result.status, result.msg);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error ending room');
    }
  }

  /**
   * HandleFetchPastRooms handles fetching past rooms
   * Equivalent to Go: rc.HandleFetchPastRooms
   * 
   * @route POST /auth/room/fetchPastRooms
   */
  @Post('fetchPastRooms')
  @HttpCode(HttpStatus.OK)
  async handleFetchPastRooms(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request (like Go: parseAndValidateRequest)
    let request: FetchPastRoomsReq;
    try {
      request = parseAndValidateRequest<FetchPastRoomsReq>(body, FetchPastRoomsReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service via NATS (plain object, not binary)
    try {
      const result = await this.natsClient
        .send({ cmd: 'room.fetchPast' }, request)
        .toPromise();

      if (result.totalRooms === 0) {
        sendCommonProtoJsonResponse(res, false, 'no info found');
        return;
      }

      const response = create(FetchPastRoomsResSchema, {
        status: true,
        msg: 'success',
        result: result,
      });

      res.status(200);
      sendProtoJsonResponse(res, FetchPastRoomsResSchema, response);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error fetching past rooms');
    }
  }
}

/**
 * RoomApiController handles room-related API operations with JWT auth
 * Routes under /api (with JwtAuthGuard)
 * Equivalent to Go: HandleEndRoomForAPI, HandleChangeVisibilityForAPI
 */
@Controller('api')
@UseGuards(JwtAuthGuard)
export class RoomApiController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  /**
   * HandleEndRoomForAPI handles ending a room via API call
   * Equivalent to Go: rc.HandleEndRoomForAPI
   * external / strict security
   * @route POST /api/endRoom
   */
  @Post('endRoom')
  @HttpCode(HttpStatus.OK)
  async handleEndRoomForAPI(
    @Req() req: Request,
    @Body() bodyBuffer: Buffer,
    @Res() res: Response,
  ): Promise<void> {
    // Get locals from JwtAuthGuard
    const isAdmin = (req as any).isAdmin as boolean;
    const tokenRoomId = (req as any).roomId as string;

    // Check admin permission
    if (!isAdmin) {
      sendCommonProtobufResponse(res, false, 'only admin can perform this task');
      return;
    }

    // Parse protobuf request
    let request: RoomEndReq;
    try {
      request = fromBinary(RoomEndReqSchema, bodyBuffer);
    } catch (error) {
      sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Validate room ID matches token
    if (tokenRoomId !== request.roomId) {
      sendCommonProtobufResponse(res, false, 'requested roomId & token roomId mismatched');
      return;
    }

    // Call room service via NATS (plain object, not binary)
    try {
      const result = await this.natsClient
        .send({ cmd: 'room.end' }, request)
        .toPromise();

      sendCommonProtobufResponse(res, result.status, result.msg);
    } catch (error) {
      sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error ending room');
    }
  }

  /**
   * HandleChangeVisibilityForAPI handles changing room visibility via API call
   * Equivalent to Go: rc.HandleChangeVisibilityForAPI
   * 
   * @route POST /api/changeVisibility
   */
  @Post('changeVisibility')
  @HttpCode(HttpStatus.OK)
  async handleChangeVisibilityForAPI(
    @Req() req: Request,
    @Body() bodyBuffer: Buffer,
    @Res() res: Response,
  ): Promise<void> {
    // Get locals from JwtAuthGuard
    const isAdmin = (req as any).isAdmin as boolean;
    const tokenRoomId = (req as any).roomId as string;

    // Check admin permission
    if (!isAdmin) {
      sendCommonProtobufResponse(res, false, 'only admin can perform this task');
      return;
    }

    // Parse protobuf request
    let request: ChangeVisibilityRes;
    try {
      request = fromBinary(ChangeVisibilityResSchema, bodyBuffer);
    } catch (error) {
      sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Validate room ID matches token
    if (tokenRoomId !== request.roomId) {
      sendCommonProtobufResponse(res, false, 'requested roomId & token roomId mismatched');
      return;
    }

    // Call room service via NATS (plain object, not binary)
    try {
      const result = await this.natsClient
        .send({ cmd: 'room.changeVisibility' }, request)
        .toPromise();

      sendCommonProtobufResponse(res, result.status, result.msg);
    } catch (error) {
      sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error changing visibility');
    }
  }
}
