import { Controller, Post, Body, Res, Get, Query, UseGuards, StreamableFile, UseInterceptors } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Response } from 'express';
import type {
    FetchAnalyticsReq,
    DeleteAnalyticsReq,
    GetAnalyticsDownloadTokenReq,
    FetchAnalyticsResult,
} from '@workspace/protocol';
import {
    FetchAnalyticsReqSchema,
    DeleteAnalyticsReqSchema,
    GetAnalyticsDownloadTokenReqSchema,
    FetchAnalyticsResultSchema,
} from '@workspace/protocol';
import { ProtobufParserPipe } from '@server/shared';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import * as fs from 'fs';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('fetch')
    async fetch(@Body(new ProtobufParserPipe(FetchAnalyticsReqSchema)) body: FetchAnalyticsReq) {
        return firstValueFrom(
            this.natsClient.send<FetchAnalyticsResult>({ cmd: 'analytics.fetch' }, body)
        );
    }

    @Post('getDownloadToken')
    async getDownloadToken(@Body(new ProtobufParserPipe(GetAnalyticsDownloadTokenReqSchema)) body: GetAnalyticsDownloadTokenReq) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'analytics.getDownloadToken' }, body)
        );
    }

    @Post('delete')
    async delete(@Body(new ProtobufParserPipe(DeleteAnalyticsReqSchema)) body: DeleteAnalyticsReq) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'analytics.delete' }, body)
        );
    }
}

@Controller('download/analytics')
export class AnalyticsDownloadController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Get()
    async download(@Query('token') token: string, @Res({ passthrough: true }) res: Response) {
        if (!token) {
            throw new Error('Token is required');
        }

        const result: any = await firstValueFrom(
            this.natsClient.send({ cmd: 'analytics.verifyDownloadToken' }, { token })
        );

        if (!result.status) {
            throw new Error('Invalid token');
        }

        // Stream file
        const file = fs.createReadStream(result.filePath);
        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${result.fileName}"`,
        });

        return new StreamableFile(file);
    }
}
