import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('api/waitingRoom')
export class WaitingRoomController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('approveUsers')
    async approveUsers(@Body() body: any) {
        return firstValueFrom(this.natsClient.send({ cmd: 'waitingRoom.approve' }, body));
    }

    @Post('updateMsg')
    async updateMsg(@Body() body: any) {
        return firstValueFrom(this.natsClient.send({ cmd: 'waitingRoom.updateMsg' }, body));
    }
}
