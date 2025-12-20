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
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
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
  async handleRecording(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'recording.api' }, body));
  }

  @Post('api/endRoom')
  async endRoom(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.end' }, body));
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
  async handleRTMP(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'recorder.rtmp' }, body));
  }

  @Post('api/changeVisibility')
  async changeVisibility(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'room.changeVisibility' }, body));
  }

  @Post('api/convertWhiteboardFile')
  async convertWhiteboardFile(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'file.convertWhiteboardFile' }, body));
  }

  @Post('api/externalMediaPlayer')
  async externalMediaPlayer(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'exMedia.handle' }, body));
  }

  @Post('api/externalDisplayLink')
  async externalDisplayLink(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'exDisplay.handle' }, body));
  }

  @Post('api/updateLockSettings')
  async updateLockSettings(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'user.updateLockSettings' }, body));
  }

  @Post('api/muteUnmuteTrack')
  async muteUnmuteTrack(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'user.muteUnmuteTrack' }, body));
  }

  @Post('api/removeParticipant')
  async removeParticipant(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'user.removeParticipant' }, body));
  }

  @Post('api/switchPresenter')
  async switchPresenter(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'user.switchPresenter' }, body));
  }
}

