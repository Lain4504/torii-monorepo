import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsUserService, USER_STATUS_OFFLINE } from '../../interfaces/nats/nats-user.service';
import { NatsMsgServerToClientEvents } from '@workspace/protocol';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';

const INGRESS_USER_ID_PREFIX = 'ingres_';
const AGENT_USER_USER_ID_PREFIX = 'wajlc_agent-';
const TTS_AGENT_USER_ID_PREFIX = 'wajlc_tts_agent-';
const SIP_USER_ID_PREFIX = 'sip_';
const USER_ONLINE_MAX_PING_DIFF = 20 * 1000; // 20 seconds

@Injectable()
export class JanitorUserService {
    private readonly logger = new Logger(JanitorUserService.name);

    constructor(
        private readonly natsService: NatsService,
        private readonly natsUserService: NatsUserService,
        private readonly livekitService: LiveKitService,
    ) { }

    /**
     * checkOnlineUsersStatus will compare last ping result
     * and take the decision to update user's status
     */
    async checkOnlineUsersStatus(): Promise<void> {
        // We need to iterate over all room buckets. 
        // In NestJS NatsService/UserService, we might not have a direct method to list all room buckets efficiently without scanning.

        try {
            const jsm = this.natsService.getJetStreamManager() as any;
            const kvs = await jsm.kv.list();
            const prefix = 'wajlc-room-';

            for await (const status of kvs) {
                const name = status.bucket;
                if (!name.startsWith(prefix)) {
                    continue;
                }

                const roomId = name.replace(prefix, '');

                // Get online users
                const userIds = await this.natsUserService.getOnlineUsersId(roomId);
                if (userIds.length === 0) {
                    continue;
                }

                for (const u of userIds) {
                    if (
                        u.startsWith(INGRESS_USER_ID_PREFIX) ||
                        u.startsWith(AGENT_USER_USER_ID_PREFIX) ||
                        u.startsWith(TTS_AGENT_USER_ID_PREFIX) ||
                        u.startsWith(SIP_USER_ID_PREFIX)
                    ) {
                        continue;
                    }

                    const lastPing = await this.natsUserService.getUserLastPing(roomId, u);
                    if (lastPing === 0) {
                        await this.changeUserStatus(roomId, u);
                        continue;
                    }

                    // Compare
                    const now = Date.now();
                    // limit = lastPing + maxDiff. If now > limit, then outdated.
                    if (now > lastPing + USER_ONLINE_MAX_PING_DIFF) {
                        this.logger.warn(`User missed ping deadline, marking as offline: room=${roomId}, user=${u}, lastPing=${lastPing}, now=${now}, diff=${now - lastPing}`);
                        await this.changeUserStatus(roomId, u);
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Error checking online users status: ${error.message}`);
        }
    }

    private async changeUserStatus(roomId: string, userId: string): Promise<void> {
        // this user should be offline
        await this.natsUserService.updateUserStatus(roomId, userId, USER_STATUS_OFFLINE);

        const info = await this.natsUserService.getUserInfo(roomId, userId);
        if (info) {
            // notify to the room
            await this.natsUserService.broadcastUserInfoToRoom(
                NatsMsgServerToClientEvents.USER_OFFLINE,
                roomId,
                userId,
                info
            );

            // also try to silently remove this user from livekit as well
            try {
                // removeParticipant is not async in some SDK versions, but let's await just in case
                await this.livekitService.removeParticipant(roomId, userId);
            } catch (error) {
                // ignore error
            }
        }
    }
}
