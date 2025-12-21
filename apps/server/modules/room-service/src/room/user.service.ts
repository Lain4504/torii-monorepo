import { Injectable, Logger } from '@nestjs/common';
import { LiveKitService } from '@server/shared';
import { RpcException } from '@nestjs/microservices';
import type {
    UpdateUserLockSettingsReq,
    MuteUnMuteTrackReq,
    RemoveParticipantReq,
    SwitchPresenterReq,
} from '@workspace/protocol';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private readonly liveKitService: LiveKitService,
    ) { }

    async updateUserLockSettings(data: UpdateUserLockSettingsReq) {
        // Convert direction to boolean
        const lock = data.direction === 'lock';

        if (data.userId === 'all') {
            const rooms = await this.liveKitService
                .getRoomClient()
                .listRooms([data.roomId]);
            if (rooms.length === 0) throw new RpcException('room not found');
            const meta: any = JSON.parse(rooms[0].metadata || '{}');
            if (!meta.default_lock_settings) meta.default_lock_settings = {};
            meta.default_lock_settings[data.service] = lock;
            await this.liveKitService
                .getRoomClient()
                .updateRoomMetadata(data.roomId, JSON.stringify(meta));
        } else {
            const p = await this.liveKitService
                .getRoomClient()
                .getParticipant(data.roomId, data.userId);
            const meta: any = JSON.parse(p.metadata || '{}');
            if (!meta.lock_settings) meta.lock_settings = {};
            meta.lock_settings[data.service] = lock;
            await this.liveKitService
                .getRoomClient()
                .updateParticipant(data.roomId, data.userId, JSON.stringify(meta));
        }
        return { status: true, msg: 'success' };
    }

    async muteUnmuteTrack(data: MuteUnMuteTrackReq) {
        if (data.userId === 'all') {
            const pList = await this.liveKitService
                .getRoomClient()
                .listParticipants(data.roomId);
            for (const p of pList) {
                const micTrack = p.tracks.find((t) => t.source === 2);
                if (micTrack) {
                    await this.liveKitService
                        .getRoomClient()
                        .mutePublishedTrack(data.roomId, p.identity, micTrack.sid, data.muted);
                }
            }
        } else {
            let trackSid = data.trackSid;
            if (!trackSid) {
                const p = await this.liveKitService
                    .getRoomClient()
                    .getParticipant(data.roomId, data.userId);
                const micTrack = p.tracks.find((t) => t.source === 2);
                if (micTrack) trackSid = micTrack.sid;
            }
            if (trackSid) {
                await this.liveKitService
                    .getRoomClient()
                    .mutePublishedTrack(data.roomId, data.userId, trackSid, data.muted);
            }
        }
        return { status: true, msg: 'success' };
    }

    async removeParticipant(data: RemoveParticipantReq) {
        await this.liveKitService
            .getRoomClient()
            .removeParticipant(data.roomId, data.userId);
        return { status: true, msg: 'success' };
    }

    async switchPresenter(data: SwitchPresenterReq) {
        // Convert enum task to boolean presenter
        const presenter = data.task === 0; // PROMOTE = true, DEMOTE = false

        const p = await this.liveKitService
            .getRoomClient()
            .getParticipant(data.roomId, data.userId);
        const meta: any = JSON.parse(p.metadata || '{}');
        meta.is_presenter = presenter;
        await this.liveKitService
            .getRoomClient()
            .updateParticipant(data.roomId, data.userId, JSON.stringify(meta));

        await this.liveKitService.getRoomClient().updateParticipant(
            data.roomId,
            data.userId,
            undefined,
            {
                canPublish: presenter,
                canSubscribe: true,
                canPublishData: true,
            } as any,
        );

        return { status: true, msg: 'success' };
    }
}
