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
        this.logger.log(`updateUserLockSettings room=${data.roomId} user=${data.userId} service=${data.service} direction=${data.direction}`);
        const roomClient = this.liveKitService.getRoomClient();
        const lock = data.direction === 'lock';
        const requestedUserId = (data as any).requestedUserId ?? (data as any).RequestedUserId;

        const assignLockSetting = (service: string, meta: Record<string, any>, key: 'default_lock_settings' | 'lock_settings') => {
            if (!meta[key]) meta[key] = {};
            const map: Record<string, string> = {
                mic: 'lock_microphone',
                webcam: 'lock_webcam',
                screenShare: 'lock_screen_sharing',
                chat: 'lock_chat',
                sendChatMsg: 'lock_chat_send_message',
                chatFile: 'lock_chat_file_share',
                privateChat: 'lock_private_chat',
                whiteboard: 'lock_whiteboard',
                sharedNotepad: 'lock_shared_notepad',
            };
            const field = map[service];
            if (!field) return false;
            meta[key][field] = lock;
            return true;
        };

        const safeParse = (payload?: string) => {
            try {
                return payload ? JSON.parse(payload) : {};
            } catch {
                return {} as Record<string, any>;
            }
        };

        // ensure room is running
        const rooms = await roomClient.listRooms([data.roomId]);
        if (rooms.length === 0) throw new RpcException("room isn't running");

        if (data.userId === 'all') {
            const roomMeta = safeParse(rooms[0].metadata);
            assignLockSetting(data.service, roomMeta, 'default_lock_settings');
            await roomClient.updateRoomMetadata(data.roomId, JSON.stringify(roomMeta));

            const participants = await roomClient.listParticipants(data.roomId);
            for (const p of participants) {
                if (requestedUserId && p.identity === requestedUserId) continue;
                const meta = safeParse(p.metadata);
                const isAdmin = meta.is_admin ?? meta.isAdmin ?? false;
                if (isAdmin && data.service !== 'whiteboard') continue;
                const ok = assignLockSetting(data.service, meta, 'lock_settings');
                if (!ok) continue;
                await roomClient.updateParticipant(data.roomId, p.identity, JSON.stringify(meta));
            }
        } else {
            let participant;
            try {
                participant = await roomClient.getParticipant(data.roomId, data.userId);
            } catch {
                throw new RpcException('participant does not exist');
            }
            const meta = safeParse(participant.metadata);
            const isAdmin = meta.is_admin ?? meta.isAdmin ?? false;
            if (isAdmin && data.service !== 'whiteboard') return { status: true, msg: 'success' };
            const ok = assignLockSetting(data.service, meta, 'lock_settings');
            if (!ok) throw new RpcException('unknown lock service');
            await roomClient.updateParticipant(data.roomId, data.userId, JSON.stringify(meta));
        }
        return { status: true, msg: 'success' };
    }

    async muteUnmuteTrack(data: MuteUnMuteTrackReq) {
        this.logger.log(`muteUnmuteTrack room=${data.roomId} target=${data.userId} trackSid=${data.trackSid || 'auto'} muted=${data.muted}`);
        const requestedUserId = (data as any).requestedUserId ?? (data as any).RequestedUserId;

        if (data.userId === 'all') {
            const pList = await this.liveKitService
                .getRoomClient()
                .listParticipants(data.roomId);
            for (const p of pList) {
                if (requestedUserId && p.identity === requestedUserId) continue;
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
                try {
                    const p = await this.liveKitService
                        .getRoomClient()
                        .getParticipant(data.roomId, data.userId);
                    const micTrack = p.tracks.find((t) => t.source === 2);
                    if (micTrack) trackSid = micTrack.sid;
                } catch (e) {
                    throw new RpcException('participant does not exist');
                }
            }
            if (trackSid) {
                await this.liveKitService
                    .getRoomClient()
                    .mutePublishedTrack(data.roomId, data.userId, trackSid, data.muted);
            }
            if (!trackSid) {
                throw new RpcException('no suitable track found to mute/unmute');
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
        const requestedUserId = (data as any).requestedUserId ?? (data as any).RequestedUserId;
        this.logger.log(`switchPresenter room=${data.roomId} task=${data.task} target=${data.userId} requestedBy=${requestedUserId}`);
        const roomClient = this.liveKitService.getRoomClient();

        const safeParse = (payload?: string) => {
            try {
                return payload ? JSON.parse(payload) : {};
            } catch {
                return {} as Record<string, any>;
            }
        };

        const updatePresenterStatus = async (roomId: string, userId: string, isPresenter: boolean) => {
            let participant;
            try {
                participant = await roomClient.getParticipant(roomId, userId);
            } catch {
                throw new RpcException('participant does not exist');
            }
            const meta = safeParse(participant.metadata);
            meta.is_presenter = isPresenter;
            await roomClient.updateParticipant(roomId, userId, JSON.stringify(meta));
            await roomClient.updateParticipant(roomId, userId, undefined, {
                canPublish: isPresenter,
                canSubscribe: true,
                canPublishData: true,
            } as any);
        };

        const participants = await roomClient.listParticipants(data.roomId);
        const findCurrentPresenter = () => {
            const current = participants.find((p) => {
                const meta = safeParse(p.metadata);
                return meta.is_presenter === true || meta.isPresenter === true;
            });
            return current?.identity;
        };

        let newPresenterId = '';
        let oldPresenterId = '';

        if (data.task === 0) { // PROMOTE
            newPresenterId = data.userId;
            oldPresenterId = findCurrentPresenter() || '';
        } else { // DEMOTE
            oldPresenterId = data.userId;
            newPresenterId = requestedUserId || '';
        }

        if (!newPresenterId) throw new RpcException('no new presenter specified');

        // Promote first
        await updatePresenterStatus(data.roomId, newPresenterId, true);

        // Then demote previous if different
        if (oldPresenterId && oldPresenterId !== newPresenterId) {
            try {
                await updatePresenterStatus(data.roomId, oldPresenterId, false);
            } catch (e) {
                this.logger.warn(`failed to demote previous presenter ${oldPresenterId}: ${e}`);
            }
        }

        return { status: true, msg: 'success' };
    }
}
