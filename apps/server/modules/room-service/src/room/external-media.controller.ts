import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExternalMediaService } from './external-media.service';
import type {
    ExternalMediaPlayerReq,
    ExternalDisplayLinkReq,
} from '@workspace/protocol';

@Controller()
export class ExternalMediaController {
    constructor(
        private readonly externalMediaService: ExternalMediaService,
    ) { }

    @MessagePattern({ cmd: 'exMedia.handle' })
    async handleExMedia(@Payload() data: ExternalMediaPlayerReq) {
        return this.externalMediaService.handleExternalMediaPlayer(data);
    }

    @MessagePattern({ cmd: 'exDisplay.handle' })
    async handleExDisplay(@Payload() data: ExternalDisplayLinkReq) {
        return this.externalMediaService.handleExternalDisplayLink(data);
    }
}
