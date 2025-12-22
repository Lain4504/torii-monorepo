import {
    Body,
    Controller,
    Get,
    HttpCode,
    Inject,
    Param,
    Post,
    Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ProtobufParserPipe } from '@server/shared';
import type {
    ArtifactInfoReq,
    DeleteArtifactReq,
    FetchArtifactsReq,
    GetArtifactDownloadTokenReq,
} from '@workspace/protocol';
import {
    ArtifactInfoReqSchema,
    DeleteArtifactReqSchema,
    FetchArtifactsReqSchema,
    GetArtifactDownloadTokenReqSchema,
} from '@workspace/protocol';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import * as path from 'path';

@Controller('auth/artifact')
export class ArtifactController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('fetch')
    @HttpCode(200)
    async fetch(@Body(new ProtobufParserPipe(FetchArtifactsReqSchema)) body: FetchArtifactsReq) {
        return firstValueFrom(this.natsClient.send({ cmd: 'artifact.fetch' }, body));
    }

    @Post('info')
    @HttpCode(200)
    async info(@Body(new ProtobufParserPipe(ArtifactInfoReqSchema)) body: ArtifactInfoReq) {
        return firstValueFrom(this.natsClient.send({ cmd: 'artifact.info' }, body));
    }

    @Post('getDownloadToken')
    @HttpCode(200)
    async getDownloadToken(@Body(new ProtobufParserPipe(GetArtifactDownloadTokenReqSchema)) body: GetArtifactDownloadTokenReq) {
        return firstValueFrom(this.natsClient.send({ cmd: 'artifact.getDownloadToken' }, body));
    }

    @Post('delete')
    @HttpCode(200)
    async delete(@Body(new ProtobufParserPipe(DeleteArtifactReqSchema)) body: DeleteArtifactReq) {
        return firstValueFrom(this.natsClient.send({ cmd: 'artifact.delete' }, body));
    }
}

@Controller('download')
export class ArtifactDownloadController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get('artifact/:token')
    async download(@Param('token') token: string, @Res() res: Response) {
        try {
            const result: any = await firstValueFrom(
                this.natsClient.send({ cmd: 'artifact.verifyDownloadToken' }, { token }),
            );

            const absolutePath = result?.absolutePath as string;
            if (!absolutePath) {
                return res.status(400).send(result?.msg || 'invalid token');
            }

            const fileName = result?.fileName || path.basename(absolutePath);
            return res.download(absolutePath, fileName, (err) => {
                if (err) {
                    res.status(404).send('File not found');
                }
            });
        } catch (err: any) {
            return res.status(400).send(err?.message || 'invalid token');
        }
    }
}
