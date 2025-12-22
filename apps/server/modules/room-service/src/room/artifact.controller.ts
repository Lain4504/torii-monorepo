import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type {
    ArtifactInfoReq,
    DeleteArtifactReq,
    FetchArtifactsReq,
    GetArtifactDownloadTokenReq,
} from '@workspace/protocol';
import { ArtifactService } from './artifact.service';

@Controller()
export class ArtifactController {
    constructor(private readonly artifactService: ArtifactService) { }

    @MessagePattern({ cmd: 'artifact.fetch' })
    async fetchArtifacts(@Payload() data: FetchArtifactsReq) {
        return this.artifactService.fetchArtifacts(data);
    }

    @MessagePattern({ cmd: 'artifact.info' })
    async getArtifactInfo(@Payload() data: ArtifactInfoReq) {
        return this.artifactService.getArtifactInfo(data.artifactId);
    }

    @MessagePattern({ cmd: 'artifact.getDownloadToken' })
    async getDownloadToken(@Payload() data: GetArtifactDownloadTokenReq) {
        return this.artifactService.getDownloadToken(data.artifactId);
    }

    @MessagePattern({ cmd: 'artifact.verifyDownloadToken' })
    async verifyDownloadToken(@Payload() data: { token: string }) {
        return this.artifactService.verifyDownloadToken(data.token);
    }

    @MessagePattern({ cmd: 'artifact.delete' })
    async deleteArtifact(@Payload() data: DeleteArtifactReq) {
        return this.artifactService.deleteArtifact(data.artifactId);
    }
}
