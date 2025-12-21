import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { LiveKitService } from '@server/shared';
import { RoomService } from './room.service';
import type {
    ExternalMediaPlayerReq,
    ExternalDisplayLinkReq,
} from '@workspace/protocol';

@Injectable()
export class ExternalMediaService {
    private readonly logger = new Logger(ExternalMediaService.name);

    constructor(
        private readonly liveKitService: LiveKitService,
        private readonly roomService: RoomService,
    ) { }

    async handleExternalMediaPlayer(data: ExternalMediaPlayerReq) {
        // Convert task enum to action string
        const action = data.task === 0 ? 'start' : 'end';

        const rooms = await this.liveKitService
            .getRoomClient()
            .listRooms([data.roomId]);
        if (rooms.length === 0) throw new RpcException('room not found');

        const meta: any = JSON.parse(rooms[0].metadata || '{}');
        if (!meta.room_features) meta.room_features = {};
        if (!meta.room_features.external_media_player_features)
            meta.room_features.external_media_player_features = {};

        if (action === 'start') {
            meta.room_features.external_media_player_features.is_active = true;
            meta.room_features.external_media_player_features.url = data.url;
        } else {
            meta.room_features.external_media_player_features.is_active = false;
        }

        await this.roomService.updateAndBroadcastRoomMetadata(data.roomId, meta);
        return { status: true, msg: 'success' };
    }

    async handleExternalDisplayLink(data: ExternalDisplayLinkReq) {
        // Convert task enum to action string
        const action = data.task === 0 ? 'start' : 'end';

        const rooms = await this.liveKitService
            .getRoomClient()
            .listRooms([data.roomId]);
        if (rooms.length === 0) throw new RpcException('room not found');

        const meta: any = JSON.parse(rooms[0].metadata || '{}');
        if (!meta.room_features) meta.room_features = {};
        if (!meta.room_features.display_external_link_features)
            meta.room_features.display_external_link_features = {};

        if (action === 'start') {
            meta.room_features.display_external_link_features.is_active = true;
            meta.room_features.display_external_link_features.url = data.url;
        } else {
            meta.room_features.display_external_link_features.is_active = false;
        }

        await this.roomService.updateAndBroadcastRoomMetadata(data.roomId, meta);
        return { status: true, msg: 'success' };
    }
}
