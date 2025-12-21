import {
    Body,
    Controller,
    Inject,
    Post,
    HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type {
    ExternalMediaPlayerReq,
    ExternalDisplayLinkReq,
} from '@workspace/protocol';

@Controller('api')
export class ExternalMediaController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('externalMediaPlayer')
    @HttpCode(200)
    async externalMediaPlayer(@Body() body: ExternalMediaPlayerReq) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'exMedia.handle' }, body),
        );
    }

    @Post('externalDisplayLink')
    @HttpCode(200)
    async externalDisplayLink(@Body() body: ExternalDisplayLinkReq) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'exDisplay.handle' }, body),
        );
    }
}
