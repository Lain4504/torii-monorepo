/**
 * Artifacts NATS Handler
 *
 * Handles NATS message patterns for artifact operations
 */

import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ArtifactsService } from '../../modules/artifacts/artifacts.service';
import {
    FetchArtifactsReq,
    ArtifactInfoReq,
    DeleteArtifactReq,
    GetArtifactDownloadTokenReq,
    ArtifactInfoRes,
    FetchArtifactsResult,
} from '@workspace/protocol';

@Controller()
export class ArtifactsHandler {
    private readonly logger = new Logger(ArtifactsHandler.name);

    constructor(
        private readonly artifactsService: ArtifactsService,
    ) { }

    @MessagePattern({ cmd: 'artifact.fetch' })
    async handleFetchArtifacts(@Payload() data: FetchArtifactsReq): Promise<any> {
        try {
            const result = await this.artifactsService.fetchArtifacts(data);
            return {
                status: true,
                msg: 'success',
                result,
            };
        } catch (error) {
            this.logger.error(`Error handling artifact.fetch: ${error.message}`);
            return {
                status: false,
                msg: error.message,
            };
        }
    }

    @MessagePattern({ cmd: 'artifact.info' })
    async handleGetArtifactInfo(@Payload() data: ArtifactInfoReq): Promise<ArtifactInfoRes> {
        try {
            return await this.artifactsService.getArtifactInfoByArtifactId(data.artifactId);
        } catch (error) {
            this.logger.error(`Error handling artifact.info: ${error.message}`);
            return {
                status: false,
                msg: error.message,
            } as ArtifactInfoRes;
        }
    }

    @MessagePattern({ cmd: 'artifact.getDownloadToken' })
    async handleGetDownloadToken(@Payload() data: GetArtifactDownloadTokenReq): Promise<any> {
        try {
            const token = await this.artifactsService.getArtifactDownloadToken(data.artifactId);
            return {
                status: true,
                msg: 'success',
                token,
            };
        } catch (error) {
            this.logger.error(`Error handling artifact.getDownloadToken: ${error.message}`);
            return {
                status: false,
                msg: error.message,
            };
        }
    }

    @MessagePattern({ cmd: 'artifact.delete' })
    async handleDeleteArtifact(@Payload() data: DeleteArtifactReq): Promise<any> {
        try {
            await this.artifactsService.deleteArtifact(data.artifactId);
            return {
                status: true,
                msg: 'success',
            };
        } catch (error) {
            this.logger.error(`Error handling artifact.delete: ${error.message}`);
            return {
                status: false,
                msg: error.message,
            };
        }
    }

    @MessagePattern({ cmd: 'artifact.verifyDownloadToken' })
    async handleVerifyDownloadToken(@Payload() data: { token: string }): Promise<any> {
        try {
            const result = await this.artifactsService.verifyArtifactDownloadJWT(data.token);
            return {
                status: true,
                ...result,
            };
        } catch (error) {
            this.logger.error(`Error handling artifact.verifyDownloadToken: ${error.message}`);
            return {
                status: false,
                msg: error.message,
            };
        }
    }
}
