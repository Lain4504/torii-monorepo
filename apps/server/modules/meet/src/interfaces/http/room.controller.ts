/**
 * Room Controller
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
  parseAndValidateRequest,
  ApiKeyGuard,
  JwtAuthGuard,
} from '@server/shared';
import { RoomCreateService } from '../../modules/room/room-create.service';
import { RoomInfoService } from '../../modules/room/room-info.service';
import { RoomEndService } from '../../modules/room/room-end.service';
import { RoomModifyService } from '../../modules/room/room-modify.service';

/**
 * RoomController handles room-related operations
 * Routes under /auth/room (with ApiKeyGuard)
 */
@Controller('auth/room')
@UseGuards(ApiKeyGuard)
export class RoomController {
  constructor(
    private readonly roomCreateService: RoomCreateService,
    private readonly roomInfoService: RoomInfoService,
    private readonly roomEndService: RoomEndService,
    private readonly roomModifyService: RoomModifyService,
  ) { }

  /**
   * HandleRoomCreate handles creating a new room
   *
   * @route POST /auth/room/create
   */
  @Post('create')
  async handleRoomCreate(
    @Body() body: any,  // Accept both JSON and binary
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request
    let request: CreateRoomReq;
    try {
      request = parseAndValidateRequest<CreateRoomReq>(body, CreateRoomReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service directly
    try {
      const roomInfo = await this.roomCreateService.createRoom(request);

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
   *
   * @route POST /auth/room/isRoomActive
   */
  @Post('isRoomActive')
  @HttpCode(HttpStatus.OK)
  async handleIsRoomActive(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request
    let request: IsRoomActiveReq;
    try {
      request = parseAndValidateRequest<IsRoomActiveReq>(body, IsRoomActiveReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service directly
    try {
      const result = await this.roomInfoService.isRoomActive(request);

      res.status(200);
      sendProtoJsonResponse(res, IsRoomActiveResSchema, result.res);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error checking room status');
    }
  }

  /**
   * HandleGetActiveRoomInfo gets information about an active room
   *
   * @route POST /auth/room/getActiveRoomInfo
   */
  @Post('getActiveRoomInfo')
  @HttpCode(HttpStatus.OK)
  async handleGetActiveRoomInfo(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request
    let request: GetActiveRoomInfoReq;
    try {
      request = parseAndValidateRequest<GetActiveRoomInfoReq>(body, GetActiveRoomInfoReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service directly
    try {
      const result = await this.roomInfoService.getActiveRoomInfo(request);

      const response = create(GetActiveRoomInfoResSchema, {
        status: result.success,
        msg: result.message,
        room: result.data || undefined,
      });

      res.status(200);
      sendProtoJsonResponse(res, GetActiveRoomInfoResSchema, response);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting room info');
    }
  }

  /**
   * HandleGetActiveRoomsInfo gets information about all active rooms
   *
   * @route POST /auth/room/getActiveRoomsInfo
   */
  @Post('getActiveRoomsInfo')
  @HttpCode(HttpStatus.OK)
  async handleGetActiveRoomsInfo(
    @Res() res: Response,
  ): Promise<void> {
    // Call room service directly
    try {
      const result = await this.roomInfoService.getActiveRoomsInfo();

      const response = create(GetActiveRoomsInfoResSchema, {
        status: result.success,
        msg: result.message,
        rooms: result.data || [],
      });

      res.status(200);
      sendProtoJsonResponse(res, GetActiveRoomsInfoResSchema, response);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting rooms info');
    }
  }

  /**
   * HandleEndRoom handles ending a room
   * internal / trusted
   * @route POST /auth/room/endRoom
   */
  @Post('endRoom')
  @HttpCode(HttpStatus.OK)
  async handleEndRoom(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request
    let request: RoomEndReq;
    try {
      request = parseAndValidateRequest<RoomEndReq>(body, RoomEndReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service directly
    try {
      const result = await this.roomEndService.endRoom(request);

      sendCommonProtoJsonResponse(res, result.status, result.msg);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error ending room');
    }
  }

  /**
   * HandleFetchPastRooms handles fetching past rooms
   *
   * @route POST /auth/room/fetchPastRooms
   */
  @Post('fetchPastRooms')
  @HttpCode(HttpStatus.OK)
  async handleFetchPastRooms(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<void> {
    // Parse and validate request
    let request: FetchPastRoomsReq;
    try {
      request = parseAndValidateRequest<FetchPastRoomsReq>(body, FetchPastRoomsReqSchema);
    } catch (error) {
      sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
      return;
    }

    // Call room service directly
    try {
      const result = await this.roomInfoService.fetchPastRooms(request);

      if (!result.totalRooms || parseInt(result.totalRooms) === 0) {
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
 */
@Controller()
@UseGuards(JwtAuthGuard)
export class RoomApiController {
  constructor(
    private readonly roomEndService: RoomEndService,
    private readonly roomModifyService: RoomModifyService,
  ) { }

  /**
   * HandleEndRoomForAPI handles ending a room via API call
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

    // Call room service directly
    try {
      const result = await this.roomEndService.endRoom(request);

      sendCommonProtobufResponse(res, result.status, result.msg);
    } catch (error) {
      sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error ending room');
    }
  }

  /**
   * HandleChangeVisibilityForAPI handles changing room visibility via API call
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

    // Call room service directly
    try {
      const result = await this.roomModifyService.changeVisibility(request);

      sendCommonProtobufResponse(res, result.status, result.msg);
    } catch (error) {
      sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error changing visibility');
    }
  }
}
