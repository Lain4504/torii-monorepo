import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { BypassTransform } from '@server/shared';

@Controller('api/waitingRoom')
export class WaitingRoomController {
    constructor(
        @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
    ) { }

    @Post('approveUsers')
    @BypassTransform()
    async approveUsers(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'waitingRoom.approve' }, body));
    }

    @Post('updateMsg')
    @BypassTransform()
    async updateMsg(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'waitingRoom.updateMsg' }, body));
    }
}
