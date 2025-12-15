import { Body, Controller, Get, Inject, Param, Post, Res, StreamableFile, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { basename } from 'path';

@Controller('recording')
export class RecordingController {
    constructor(
        @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
    ) { }

    @Post('start')
    async start(@Body() body: { roomName: string }) {
        return firstValueFrom(this.roomClient.send({ cmd: 'recording.start' }, body));
    }

    @Post('stop')
    async stop(@Body() body: { roomName: string }) {
        return firstValueFrom(this.roomClient.send({ cmd: 'recording.stop' }, body));
    }

    @Post('fetch')
    async fetch(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'recording.fetch' }, body));
    }

    @Post('delete')
    async delete(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'recording.delete' }, body));
    }

    @Post('token')
    async getDownloadToken(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'recording.getDownloadToken' }, body));
    }

    @Get('download/:token')
    async download(@Param('token') token: string, @Res({ passthrough: true }) res: Response) {
        try {
            const result = await firstValueFrom(this.roomClient.send({ cmd: 'recording.verifyDownloadToken' }, { token }));

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
