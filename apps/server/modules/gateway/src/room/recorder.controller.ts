import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth/recorder')
export class RecorderController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('notify')
    async notify(@Body() body: any) {
        return firstValueFrom(this.natsClient.send({ cmd: 'recorder.events' }, body));
    }
}
