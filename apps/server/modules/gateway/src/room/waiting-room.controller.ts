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
        @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
    ) { }

    @Post('approveUsers')
    async approveUsers(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'waitingRoom.approve' }, body));
    }

    @Post('updateMsg')
    async updateMsg(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'waitingRoom.updateMsg' }, body));
    }
}
