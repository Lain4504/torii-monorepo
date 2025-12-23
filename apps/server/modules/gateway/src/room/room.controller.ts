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
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { fromBinary, toBinary, create } from '@bufbuild/protobuf';
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

    // Call room service via NATS
    try {
      const roomInfo = await this.natsClient
        .send('room.create', toBinary(CreateRoomReqSchema, request))
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
  async handleIsRoomActive(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request (like Go: parseAndValidateRequest)
    let request: IsRoomActiveReq;
    try {
      request = parseAndValidateRequest<IsRoomActiveReq>(body, IsRoomActiveReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service via NATS
    try {
      const response = await this.natsClient
        .send('room.isActive', toBinary(IsRoomActiveReqSchema, request))
        .toPromise();

      res.status(200);
      sendProtoJsonResponse(res, IsRoomActiveResSchema, response);
    } catch (error) {
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

    // Call room service via NATS
    try {
      const result = await this.natsClient
        .send('room.getActiveInfo', toBinary(GetActiveRoomInfoReqSchema, request))
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
  async handleGetActiveRoomsInfo(
    @Res() res: Response,
  ): Promise<void> {
    // Call room service via NATS (no request body)
    try {
      const result = await this.natsClient
        .send('room.getActiveRoomsInfo', {})
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

    // Call room service via NATS
    try {
      const result = await this.natsClient
        .send('room.end', toBinary(RoomEndReqSchema, request))
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

    // Call room service via NATS
    try {
      const result = await this.natsClient
        .send('room.fetchPast', toBinary(FetchPastRoomsReqSchema, request))
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

    // Call room service via NATS
    try {
      const result = await this.natsClient
        .send('room.end', toBinary(RoomEndReqSchema, request))
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

    // Call room service via NATS
    try {
      const result = await this.natsClient
        .send('room.changeVisibility', toBinary(ChangeVisibilityResSchema, request))
        .toPromise();

      sendCommonProtobufResponse(res, result.status, result.msg);
    } catch (error) {
      sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error changing visibility');
    }
  }
}
