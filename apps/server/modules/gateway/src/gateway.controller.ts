import {
  Controller,
  Get,
  Query,
  Post,
  Req,
  Header,
  HttpCode,
  Res,
  UseGuards,
  Body, Inject, Param,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiKeyGuard } from '@server/shared/guards/api-key.guard';


import { GatewayService } from './gateway.service';
import { firstValueFrom } from "rxjs";
import { ClientProxy } from "@nestjs/microservices";

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
  ) { }

  @Get('/health/auth')
  pingAuth() {
    return this.gatewayService.pingAuth();
  }

  @Get('healthCheck')
  healthCheck() {
    return { status: 'success', msg: 'System is up' };
  }

  @Get('/auth/validate')
  validate(@Query('token') token?: string) {
    return this.gatewayService.validateToken(token);
  }

  @Post('api/verifyToken')

  async verifyToken(@Req() req: any, @Res() res: Response) {
    const authHeader = req.headers['authorization'] || '';
    // raw body is guaranteed by main.ts middleware for application/protobuf
    // but we safety check
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const result = await this.gatewayService.verifyPnmToken(authHeader, body);
    res.setHeader('Content-Type', 'application/protobuf');
    res.status(200).send(Buffer.from(result));
  }

  @Post('api/recording')
  @BypassTransform()
  async handleRecording(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'recording.api' }, body));
  }

  @Post('api/endRoom')
  @BypassTransform()
  async endRoom(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.end' }, body));
  }

  @Get('/download/analytics/:token')
  async downloadAnalytics(@Param('token') token: string) {
    // Need implementation
    return { status: false, msg: 'Not implemented' };
  }

  @Get('/download/artifact/:token')
  async downloadArtifact(@Param('token') token: string) {
    // Need implementation
    return { status: false, msg: 'Not implemented' };
  }

  @Post('api/rtmp')
  @BypassTransform()
  async handleRTMP(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'recorder.rtmp' }, body));
  }

  @Post('api/changeVisibility')
  @BypassTransform()
  async changeVisibility(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'room.changeVisibility' }, body));
  }

  @Post('api/convertWhiteboardFile')
  @BypassTransform()
  async convertWhiteboardFile(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'file.convertWhiteboardFile' }, body));
  }

  @Post('api/externalMediaPlayer')
  @BypassTransform()
  async externalMediaPlayer(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'exMedia.handle' }, body));
  }

  @Post('api/externalDisplayLink')
  @BypassTransform()
  async externalDisplayLink(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'exDisplay.handle' }, body));
  }

  @Post('api/updateLockSettings')
  @BypassTransform()
  async updateLockSettings(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'user.updateLockSettings' }, body));
  }

  @Post('api/muteUnmuteTrack')
  @BypassTransform()
  async muteUnmuteTrack(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'user.muteUnmuteTrack' }, body));
  }

  @Post('api/removeParticipant')
  @BypassTransform()
  async removeParticipant(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'user.removeParticipant' }, body));
  }

  @Post('api/switchPresenter')
  @BypassTransform()
  async switchPresenter(@Body() body: any) {
    return firstValueFrom(this.roomClient.send({ cmd: 'user.switchPresenter' }, body));
  }
}

