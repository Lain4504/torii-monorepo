/**
 * Recording API Controller (Gateway)
 *
 * Handles recording and RTMP task operations via Gateway -> NATS -> Meet Service
 */

import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  Req,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { fromBinary } from '@bufbuild/protobuf';
import {
  RecordingReq,
  RecordingReqSchema,
  RecordingTasks,
} from '@workspace/protocol';
import { sendCommonProtobufResponse, JwtAuthGuard } from '@server/shared';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class RecordingApiController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  /**
   * HandleRecorderTasks handles start/stop recording & RTMP requests
   * @route POST /api/recording
   * @route POST /api/rtmp
   */
  @Post(['recording', 'rtmp'])
  @HttpCode(HttpStatus.OK)
  async handleRecorderTasks(
    @Req() req: Request,
    @Body() bodyBuffer: Buffer,
    @Res() res: Response,
  ): Promise<void> {
    const isAdmin = (req as any).isAdmin as boolean;
    const tokenRoomId = (req as any).roomId as string;

    if (!isAdmin) {
      sendCommonProtobufResponse(res, false, 'only admin can start recording');
      return;
    }

    if (!tokenRoomId) {
      sendCommonProtobufResponse(res, false, 'no roomId in token');
      return;
    }

    let request: RecordingReq;
    try {
      request = fromBinary(RecordingReqSchema, bodyBuffer);
    } catch (error) {
      sendCommonProtobufResponse(
        res,
        false,
        error instanceof Error ? error.message : 'Invalid request',
      );
      return;
    }

    // Check if room is running (via NATS)
    try {
      const roomData: any = await firstValueFrom(
        this.natsClient.send({ cmd: 'room.isActive' }, { roomId: tokenRoomId }),
      );

      // roomData here is { res: IsRoomActiveRes, rInfo, meta } (after my previous fix)
      const rr = roomData.res;
      const rInfo = roomData.rInfo;

      if (!rr || !rr.isActive || !rInfo) {
        sendCommonProtobufResponse(res, false, 'notifications.room-not-active');
        return;
      }

      if (rInfo.roomId !== tokenRoomId) {
        sendCommonProtobufResponse(res, false, 'roomId in token mismatched');
        return;
      }

      // Specific task checks (Logic matches Go)
      switch (request.task) {
        case RecordingTasks.START_RECORDING:
          if (rInfo.isRecording) {
            sendCommonProtobufResponse(
              res,
              false,
              'notifications.recording-already-running',
            );
            return;
          }
          break;
        case RecordingTasks.STOP_RECORDING:
          if (!rInfo.isRecording) {
            sendCommonProtobufResponse(
              res,
              false,
              'notifications.recording-not-running',
            );
            return;
          }
          break;
        case RecordingTasks.START_RTMP:
          if (!request.rtmpUrl) {
            sendCommonProtobufResponse(res, false, 'rtmpUrl required');
            return;
          }
          if (rInfo.isActiveRtmp) {
            sendCommonProtobufResponse(
              res,
              false,
              'notifications.rtmp-already-running',
            );
            return;
          }
          break;
        case RecordingTasks.STOP_RTMP:
          if (!rInfo.isActiveRtmp) {
            sendCommonProtobufResponse(
              res,
              false,
              'notifications.rtmp-not-running',
            );
            return;
          }
          break;
      }

      // Set IDs for NATS dispatch
      request.roomId = rInfo.roomId;
      request.roomTableId = BigInt(rInfo.dbTableId).toString();

      // Dispatch task via NATS
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'recording.dispatch' }, request),
      );

      sendCommonProtobufResponse(res, result.status, result.msg || 'success');
    } catch (error) {
      sendCommonProtobufResponse(
        res,
        false,
        error instanceof Error
          ? error.message
          : 'Error processing recorder task',
      );
    }
  }
}
