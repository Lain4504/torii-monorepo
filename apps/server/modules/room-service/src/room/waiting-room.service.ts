import {ApproveWaitingUsersReq, UpdateWaitingRoomMessageReq} from "@workspace/protocol";
import {RpcException} from "@nestjs/microservices";
import {LiveKitService} from "@server/shared";
import {RoomService} from "./room.service";
import {Injectable} from "@nestjs/common";
@Injectable()
export class WaitingRoomService {
    private readonly logger = new (require('@nestjs/common').Logger)(WaitingRoomService.name);
    constructor(
        private readonly liveKitService: LiveKitService,
        private readonly roomService: RoomService
    ) { }

    async approveWaitingUsers(data: ApproveWaitingUsersReq) {
        try {
            this.logger.log(
                `Approving waiting users in room: ${data.roomId}, user: ${data.userId}`,
            );

            const participants = await this.liveKitService
                .getRoomClient()
                .listParticipants(data.roomId);

            for (const p of participants) {
                if (data.userId === 'all' || p.identity === data.userId) {
                    // Update participant metadata to remove "waitForApproval" flag
                    // We assume metadata is JSON.
                    let meta: any = {};
                    try {
                        meta = JSON.parse(p.metadata);
                    } catch (e) { }

                    if (meta.waitForApproval) {
                        meta.waitForApproval = false;
                        await this.liveKitService
                            .getRoomClient()
                            .updateParticipant(data.roomId, p.identity, JSON.stringify(meta));

                        // Notify user (system message)
                        await this.roomService.sendSystemChatMessage({
                            roomId: data.roomId,
                            msg: `User ${p.name} approved.`,
                        });
                    }
                }
            }
            return { success: true };
        } catch (error) {
            this.logger.error(`Error approving users: ${error.message}`);
            throw new RpcException(error.message);
        }
    }

    async updateWaitingRoomMessage(data: UpdateWaitingRoomMessageReq) {
        try {
            // This is typically stored in Room Metadata
            // Fetch current room metadata
            const room = await this.liveKitService
                .getRoomClient()
                .listRooms([data.roomId]);
            if (room.length === 0) throw new Error('Room not found');

            const currentMetaStr = room[0].metadata;
            let currentMeta: any = {};
            try {
                currentMeta = JSON.parse(currentMetaStr);
            } catch (e) { }

            // Update waiting message
            if (!currentMeta.roomFeatures) currentMeta.roomFeatures = {};
            if (!currentMeta.roomFeatures.waitingRoomFeatures)
                currentMeta.roomFeatures.waitingRoomFeatures = {};
            currentMeta.roomFeatures.waitingRoomFeatures.waitingRoomMsg = data.msg;

            // Save back to LiveKit
            await this.liveKitService
                .getRoomClient()
                .updateRoomMetadata(data.roomId, JSON.stringify(currentMeta));

            return { success: true };
        } catch (error) {
            this.logger.error(
                `Error updating waiting room message: ${error.message}`,
            );
            throw new RpcException(error.message);
        }
    }

}