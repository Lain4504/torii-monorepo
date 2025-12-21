import {
    Body,
    Controller,
    Inject,
    Post,
    HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('api')
export class FileController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('convertWhiteboardFile')
    @HttpCode(200)
    async convertWhiteboardFile(@Body() body: { roomId: string; fileId: string }) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'file.convertWhiteboardFile' }, body),
        );
    }
}
