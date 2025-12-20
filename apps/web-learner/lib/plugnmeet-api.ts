import { getHashSignature } from './crypto-utils';
import { plugNmeetConfig } from './plugnmeet-config';

// Type definitions for plugNmeet API
export interface RoomFeatures {
    allow_webcams?: boolean;
    mute_on_start?: boolean;
    allow_screen_share?: boolean;
    allow_rtmp?: boolean;
    admin_only_webcams?: boolean;
    allow_view_other_webcams?: boolean;
    allow_view_other_users_list?: boolean;
    room_duration?: number;
    enable_analytics?: boolean;
    allow_virtual_bg?: boolean;
    allow_raise_hand?: boolean;
    recording_features?: {
        is_allow?: boolean;
        is_allow_cloud?: boolean;
        is_allow_local?: boolean;
        enable_auto_cloud_recording?: boolean;
        only_record_admin_webcams?: boolean;
    };
    chat_features?: {
        is_allow?: boolean;
        is_allow_file_upload?: boolean;
        max_file_size?: number;
        allowed_file_types?: string[];
    };
    shared_note_pad_features?: {
        is_allow?: boolean;
    };
    whiteboard_features?: {
        is_allow?: boolean;
    };
    external_media_player_features?: {
        is_allow?: boolean;
    };
    waiting_room_features?: {
        is_active?: boolean;
    };
    breakout_room_features?: {
        is_allow?: boolean;
        allowed_number_rooms?: number;
    };
    display_external_link_features?: {
        is_allow?: boolean;
    };
    ingress_features?: {
        is_allow?: boolean;
    };
    polls_features?: {
        is_allow?: boolean;
    };
    insights_features?: {
        is_allow?: boolean;
        transcription_features?: {
            is_allow?: boolean;
            is_allow_translation?: boolean;
            is_allow_speech_synthesis?: boolean;
        };
        chat_translation_features?: {
            is_allow?: boolean;
        };
        ai_features?: {
            is_allow?: boolean;
            ai_text_chat_features?: {
                is_allow?: boolean;
            };
            meeting_summarization_features?: {
                is_allow?: boolean;
            };
        };
    };
    end_to_end_encryption_features?: {
        is_enabled?: boolean;
        included_chat_messages?: boolean;
        included_whiteboard?: boolean;
        enabled_self_insert_encryption_key?: boolean;
    };
}

export interface RoomMetadata {
    room_title?: string;
    welcome_message?: string;
    webhook_url?: string;
    logout_url?: string;
    room_features?: RoomFeatures;
}

export interface RoomInfo {
    room_id: string;
    empty_timeout?: number;
    metadata?: RoomMetadata;
}

export interface UserMetadata {
    record_webcam?: boolean;
    preferred_lang?: string;
}

export interface UserInfo {
    is_admin: boolean;
    name: string;
    user_id: string;
    user_metadata?: UserMetadata;
}

export interface IsRoomActiveRequest {
    room_id: string;
}

export interface IsRoomActiveResponse {
    status: boolean;
    msg: string;
    is_active?: boolean;
}

export interface CreateRoomResponse {
    status: boolean;
    msg: string;
    room_id?: string;
}

export interface GetJoinTokenRequest {
    room_id: string;
    user_info: UserInfo;
}

export interface GetJoinTokenResponse {
    status: boolean;
    msg: string;
    token?: string;
}

/**
 * PlugNmeet API Service
 * Handles all API communication with plugNmeet server
 */
export class PlugNmeetApiService {
    private apiKey: string;
    private apiSecret: string;
    private serverUrl: string;

    constructor(apiKey: string, apiSecret: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.serverUrl = plugNmeetConfig.serverUrl;
    }

    /**
     * Send authenticated request to plugNmeet server
     */
    private async sendRequest<T>(body: any, method: string): Promise<T> {
        const bodyString = JSON.stringify(body);
        const signature = await getHashSignature(this.apiSecret, bodyString);

        const headers = {
            'Content-Type': 'application/json',
            'API-KEY': this.apiKey,
            'HASH-SIGNATURE': signature,
        };

        const response = await fetch(`${this.serverUrl}/auth/${method}`, {
            method: 'POST',
            headers: headers,
            body: bodyString,
        });

        if (response.status !== 200) {
            const errorText = response.statusText;
            console.error('API Error:', errorText);
            throw new Error(errorText);
        }

        return await response.json();
    }

    /**
     * Check if a room is active
     */
    async isRoomActive(roomId: string): Promise<IsRoomActiveResponse> {
        const request: IsRoomActiveRequest = { room_id: roomId };
        return this.sendRequest<IsRoomActiveResponse>(request, 'room/isRoomActive');
    }

    /**
     * Create a new room
     */
    async createRoom(roomInfo: RoomInfo): Promise<CreateRoomResponse> {
        return this.sendRequest<CreateRoomResponse>(roomInfo, 'room/create');
    }

    /**
     * Get join token for a room
     */
    async getJoinToken(request: GetJoinTokenRequest): Promise<GetJoinTokenResponse> {
        return this.sendRequest<GetJoinTokenResponse>(request, 'room/getJoinToken');
    }
}
