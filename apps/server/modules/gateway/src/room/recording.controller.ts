import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { basename } from 'path';
import type {
  FetchRecordingsReq,
  DeleteRecordingReq,
  GetDownloadTokenReq,
} from '@workspace/protocol';

@Controller('auth/recording')
export class RecordingController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Post('start')
  async start(@Body() body: { roomName: string }) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'recording.start' }, body),
    );
  }

  @Post('stop')
  async stop(@Body() body: { roomName: string }) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'recording.stop' }, body),
    );
  }

  @Post('fetch')
  async fetch(@Body() body: FetchRecordingsReq) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'recording.fetch' }, body),
    );
  }

  @Post('delete')
  async delete(@Body() body: DeleteRecordingReq) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'recording.delete' }, body),
    );
  }

  @Post('info')
  async info(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'recording.info' }, body));
  }

  @Post('recordingInfo')
  async recordingInfo(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'recording.info' }, body));
  }

  @Post('updateMetadata')
  async updateMetadata(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'recording.updateMetadata' }, body));
  }

  @Post('getDownloadToken')
  async getDownloadToken(@Body() body: GetDownloadTokenReq) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'recording.getDownloadToken' }, body),
    );
  }

  @Get('/download/recording/:token')
  async download(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'recording.verifyDownloadToken' },
          { token },
        ),
      );

      if (!result || !result.isValid) {
        throw new NotFoundException('Invalid or expired token');
      }

      if (!existsSync(result.filePath)) {
        throw new NotFoundException('File not found');
      }

      const file = createReadStream(result.filePath);
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${basename(result.filePath)}"`,
      });
      return new StreamableFile(file);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}

