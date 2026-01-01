/**
 * Waiting Room Controller
 * 
 * Handles HTTP endpoints for waiting room operations
 * Routes under /api/waitingRoom (with JWT auth)
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
import { fromBinary } from '@bufbuild/protobuf';
import {
    ApproveWaitingUsersReq,
    ApproveWaitingUsersReqSchema,
    UpdateWaitingRoomMessageReq,
    UpdateWaitingRoomMessageReqSchema,
} from '@workspace/protocol';
import {
    sendCommonProtobufResponse,
    JwtAuthGuard,
} from '@server/shared';
import { WaitingRoomService } from '../../modules/waiting-room/waiting-room.service';

/**
 * WaitingRoomController handles waiting room operations
 * Routes under /api/waitingRoom (with JwtAuthGuard)
 */
@Controller('api/waitingRoom')
@UseGuards(JwtAuthGuard)
export class WaitingRoomController {
    constructor(
        private readonly waitingRoomService: WaitingRoomService,
    ) { }

    /**
     * handleApproveUsers handles approving users from the waiting room
     * 
     * @route POST /api/waitingRoom/approveUsers
     */
    @Post('approveUsers')
    @HttpCode(HttpStatus.OK)
    async handleApproveUsers(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        // Get locals from JwtAuthGuard
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;

        // Check admin permission
        if (!isAdmin) {
            sendCommonProtobufResponse(res, false, 'only admin can perform this task');
            return;
        }

        // Parse protobuf request
        let request: ApproveWaitingUsersReq;
        try {
            request = fromBinary(ApproveWaitingUsersReqSchema, bodyBuffer);
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        // Set roomId from token
        request.roomId = roomId;

        // Call service directly
        try {
            await this.waitingRoomService.approveWaitingUsers(request);

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error approving users');
        }
    }

    /**
     * handleUpdateWaitingRoomMessage handles updating the waiting room message
     * 
     * @route POST /api/waitingRoom/updateMsg
     */
    @Post('updateMsg')
    @HttpCode(HttpStatus.OK)
    async handleUpdateWaitingRoomMessage(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        // Get locals from JwtAuthGuard
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;

        // Check admin permission
        if (!isAdmin) {
            sendCommonProtobufResponse(res, false, 'only admin can perform this task');
            return;
        }

        // Parse protobuf request
        let request: UpdateWaitingRoomMessageReq;
        try {
            request = fromBinary(UpdateWaitingRoomMessageReqSchema, bodyBuffer);
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        // Set roomId from token
        request.roomId = roomId;

        // Call service directly
        try {
            await this.waitingRoomService.updateWaitingRoomMessage(request);

            sendCommonProtobufResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtobufResponse(res, false, error instanceof Error ? error.message : 'Error updating waiting room message');
        }
    }
}
