import {
    Body,
    Controller,
    Get,
    Inject,
    Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { BypassTransform } from '@server/shared';

@Controller('api/breakoutRoom')
export class BreakoutRoomController {
    constructor(
        @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
    ) { }

    @Post('create')
    @BypassTransform()
    async create(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'breakout.create' }, body));
    }

    @Post('join')
    @BypassTransform()
    async join(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'breakout.join' }, body));
    }

    @Get('listRooms')
    async listRooms() {
        return firstValueFrom(this.roomClient.send({ cmd: 'breakout.list' }, {}));
    }

    @Get('myRooms')
    async myRooms() {
        return firstValueFrom(this.roomClient.send({ cmd: 'breakout.myRooms' }, {}));
    }

    @Post('increaseDuration')
    @BypassTransform()
    async increaseDuration(@Body() body: any) {
        return firstValueFrom(
            this.roomClient.send({ cmd: 'breakout.increaseDuration' }, body),
        );
    }

    @Post('sendMsg')
    @BypassTransform()
    async sendMsg(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'breakout.sendMsg' }, body));
    }

    @Post('endRoom')
    @BypassTransform()
    async endRoom(@Body() body: any) {
        return firstValueFrom(this.roomClient.send({ cmd: 'breakout.endRoom' }, body));
    }

    @Post('endAllRooms')
    @BypassTransform()
    async endAllRooms(@Body() body: any) {
        return firstValueFrom(
            this.roomClient.send({ cmd: 'breakout.endAllRooms' }, body),
        );
    }
}
