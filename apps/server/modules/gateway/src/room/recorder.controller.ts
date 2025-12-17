import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { BypassTransform } from '@server/shared';

@Controller('auth/recorder')
export class RecorderController {
    constructor(
        @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
    ) { }

    @Post('notify')
    @BypassTransform()
    async notify(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'recorder.events' }, body));
    }
}
