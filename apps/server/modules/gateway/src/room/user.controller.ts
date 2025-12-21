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
    UpdateUserLockSettingsReq,
    MuteUnMuteTrackReq,
    RemoveParticipantReq,
    SwitchPresenterReq,
} from '@workspace/protocol';

@Controller('api')
export class UserController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('updateLockSettings')
    @HttpCode(200)
    async updateLockSettings(@Body() body: UpdateUserLockSettingsReq) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'user.updateLockSettings' }, body),
        );
    }

    @Post('muteUnmuteTrack')
    @HttpCode(200)
    async muteUnmuteTrack(@Body() body: MuteUnMuteTrackReq) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'user.muteUnmuteTrack' }, body),
        );
    }

    @Post('removeParticipant')
    @HttpCode(200)
    async removeParticipant(@Body() body: RemoveParticipantReq) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'user.removeParticipant' }, body),
        );
    }

    @Post('switchPresenter')
    @HttpCode(200)
    async switchPresenter(@Body() body: SwitchPresenterReq) {
        return firstValueFrom(
            this.natsClient.send({ cmd: 'user.switchPresenter' }, body),
        );
    }
}
