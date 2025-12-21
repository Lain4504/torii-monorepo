import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import type {
    UpdateUserLockSettingsReq,
    MuteUnMuteTrackReq,
    RemoveParticipantReq,
    SwitchPresenterReq,
} from '@workspace/protocol';

@Controller()
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @MessagePattern({ cmd: 'user.updateLockSettings' })
    async updateLockSettings(@Payload() data: UpdateUserLockSettingsReq) {
        return this.userService.updateUserLockSettings(data);
    }

    @MessagePattern({ cmd: 'user.muteUnmuteTrack' })
    async muteUnmuteTrack(@Payload() data: MuteUnMuteTrackReq) {
        return this.userService.muteUnmuteTrack(data);
    }

    @MessagePattern({ cmd: 'user.removeParticipant' })
    async removeParticipant(@Payload() data: RemoveParticipantReq) {
        return this.userService.removeParticipant(data);
    }

    @MessagePattern({ cmd: 'user.switchPresenter' })
    async switchPresenter(@Payload() data: SwitchPresenterReq) {
        return this.userService.switchPresenter(data);
    }
}
