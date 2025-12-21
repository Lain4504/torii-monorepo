import {
    Body,
    Controller,
    Get,
    Inject,
    Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type {
    CreateBreakoutRoomsReq,
    JoinBreakoutRoomReq,
    IncreaseBreakoutRoomDurationReq,
    BroadcastBreakoutRoomMsgReq,
    EndBreakoutRoomReq,
} from '@workspace/protocol';

@Controller('api/breakoutRoom')
export class BreakoutRoomController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('create')
    async create(@Body() body: CreateBreakoutRoomsReq) {
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.create' }, body));
    }

    @Post('join')
    async join(@Body() body: JoinBreakoutRoomReq) {
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.join' }, body));
    }

    @Get('listRooms')
    async listRooms() {
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.list' }, {}));
    }

    @Get('myRooms')
    async myRooms() {
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.myRooms' }, {}));
    }

    @Post('increaseDuration')
    async increaseDuration(@Body() body: IncreaseBreakoutRoomDurationReq) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'breakout.increaseDuration' }, body),
        );
    }

    @Post('sendMsg')
    async sendMsg(@Body() body: BroadcastBreakoutRoomMsgReq) {
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.sendMsg' }, body));
    }

    @Post('endRoom')
    async endRoom(@Body() body: EndBreakoutRoomReq) {
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.endRoom' }, body));
    }

    @Post('endAllRooms')
    async endAllRooms(@Body() body: { roomId: string }) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'breakout.endAllRooms' }, body),
        );
    }
}
