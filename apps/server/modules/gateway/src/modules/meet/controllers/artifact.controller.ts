/**
 * Artifact Controller (Gateway)
 *
 * Handles HTTP requests for artifact operations and routes to Meet service via NATS
 */

import { Controller, Get, Post, Body, Param, Res, Query, Delete, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Response } from 'express';
import { lastValueFrom } from 'rxjs';
import {
    FetchArtifactsReq,
    ArtifactInfoReq,
    DeleteArtifactReq,
    GetArtifactDownloadTokenReq,
    ArtifactInfoRes,
} from '@workspace/protocol';

@Controller('meet/artifact')
export class ArtifactController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy
    ) { }

    @Post('fetch')
    async fetchArtifacts(@Body() req: FetchArtifactsReq) {
        return await lastValueFrom(
            this.natsClient.send({ cmd: 'artifact.fetch' }, req)
        );
    }

    @Get('info/:artifactId')
    async getArtifactInfo(@Param('artifactId') artifactId: string) {
        const req: ArtifactInfoReq = { artifactId } as any;
        return await lastValueFrom(
            this.natsClient.send({ cmd: 'artifact.info' }, req)
        );
    }

    @Delete('delete/:artifactId')
    async deleteArtifact(@Param('artifactId') artifactId: string) {
        const req: DeleteArtifactReq = { artifactId } as any;
        return await lastValueFrom(
            this.natsClient.send({ cmd: 'artifact.delete' }, req)
        );
    }

    @Get('get-download-token/:artifactId')
    async getDownloadToken(@Param('artifactId') artifactId: string) {
        const req: GetArtifactDownloadTokenReq = { artifactId } as any;
        return await lastValueFrom(
            this.natsClient.send({ cmd: 'artifact.getDownloadToken' }, req)
        );
    }

    /**
     * Download artifact file
     * This is handled locally in the Gateway because it serves files from the shared storage
     */
    @Get('download/:token')
    async downloadArtifact(@Param('token') token: string, @Res() res: Response) {
        // We need to verify the token first.
        // Since the verification logic depends on ArtifactsService in Meet, 
        // we'll ask Meet service to verify it and return the paths.

        try {
            // Note: We'll add a new NATS pattern for verification or just use a shared helper if available.
            // For now, let's assume we send a verify request to Meet.
            const verifyRes = await lastValueFrom(
                this.natsClient.send({ cmd: 'artifact.verifyDownloadToken' }, { token })
            );

            if (!verifyRes.status) {
                return res.status(HttpStatus.FORBIDDEN).json(verifyRes);
            }

            // In a real monorepo with shared storage, Gateway can serve the file
            // Otherwise, we might need a separate storage service or proxy.
            // The Go version serves it directly from the local disk.

            const { absolutePath, fileName } = verifyRes;
            res.download(absolutePath, fileName);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: false,
                msg: error.message
            });
        }
    }
}
