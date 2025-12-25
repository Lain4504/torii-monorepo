/**
 * LiveKit Service
 *
 * Handles LiveKit participant operations
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoomServiceClient, AccessToken } from 'livekit-server-sdk';
import { NatsKvUserInfo } from '@workspace/protocol';

/**
 * LiveKitService handles participant operations with LiveKit server
 */
@Injectable()
export class LiveKitService {
    private readonly logger = new Logger(LiveKitService.name);
    private readonly client: RoomServiceClient;

    constructor(private readonly configService: ConfigService) {
        const livekitHost = this.configService.get<string>('LIVEKIT_API_URL');
        const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
        const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

        if (!livekitHost || !apiKey || !apiSecret) {
            throw new Error('LiveKit configuration is missing. Please check LIVEKIT_API_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET');
        }

        this.client = new RoomServiceClient(livekitHost, apiKey, apiSecret);
        this.logger.log(`LiveKit client initialized: ${livekitHost}`);
    }

    /**
     * LoadParticipants will load all the participant info from livekit
     *
     * @param roomId - The room ID to load participants from
     * @returns Array of ParticipantInfo or null
     */
    async loadParticipants(roomId: string): Promise<any[] | null> {
        try {
            this.logger.debug(`Loading participants for room: ${roomId}`);

            const participants = await this.client.listParticipants(roomId);

            if (!participants || participants.length === 0) {
                return null;
            }

            this.logger.debug(`Loaded ${participants.length} participants for room: ${roomId}`);
            return participants;
        } catch (error) {
            this.logger.error(`Failed to load participants for room ${roomId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * LoadParticipantInfo will load single participant info by identity
     *
     * @param roomId - The room ID
     * @param identity - The participant identity
     * @returns ParticipantInfo or throws error
     */
    async loadParticipantInfo(roomId: string, identity: string): Promise<any> {
        try {
            this.logger.debug(`Loading participant info: ${identity} in room: ${roomId}`);

            const participant = await this.client.getParticipant(roomId, identity);

            if (!participant) {
                throw new Error('participant not found');
            }

            this.logger.debug(`Loaded participant: ${identity}`);
            return participant;
        } catch (error) {
            this.logger.error(`Failed to load participant ${identity} in room ${roomId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * RemoveParticipant will send a request to livekit to remove user
     *
     * @param roomId - The room ID
     * @param userId - The user/participant identity to remove
     * @returns RemoveParticipantResponse
     */
    async removeParticipant(roomId: string, userId: string): Promise<any> {
        try {
            this.logger.log(`Removing participant: ${userId} from room: ${roomId}`);

            const response = await this.client.removeParticipant(roomId, userId);

            this.logger.log(`Successfully removed participant: ${userId} from room: ${roomId}`);
            return response;
        } catch (error) {
            this.logger.error(`Failed to remove participant ${userId} from room ${roomId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * EndRoom will send API request to livekit to delete the room
     *
     * @param roomId - The room ID to delete
     * @returns Response string or error message
     */
    async endRoom(roomId: string): Promise<string> {
        try {
            this.logger.log(`Ending room via LiveKit: ${roomId}`);

            //  SDK handles timeout internally
            await this.client.deleteRoom(roomId);

            this.logger.log(`Successfully ended room: ${roomId}`);

            // Return success message
            return `Room ${roomId} deleted successfully`;
        } catch (error) {
            this.logger.error(`Failed to end room ${roomId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * MuteUnMuteTrack mutes/unmutes a published track
     *
     * @param roomId - Room ID
     * @param userId - User/participant identity
     * @param trackSid - Track SID to mute/unmute
     * @param muted - True to mute, false to unmute
     * @returns MuteRoomTrackResponse
     */
    async muteUnMuteTrack(
        roomId: string,
        userId: string,
        trackSid: string,
        muted: boolean
    ): Promise<any> {
        try {
            this.logger.log(
                `${muted ? 'Muting' : 'Unmuting'} track ${trackSid} for user ${userId} in room ${roomId}`
            );

            const response = await this.client.mutePublishedTrack(roomId, userId, trackSid, muted);

            this.logger.log(`Successfully ${muted ? 'muted' : 'unmuted'} track ${trackSid}`);
            return response;
        } catch (error) {
            this.logger.error(
                `Failed to ${muted ? 'mute' : 'unmute'} track ${trackSid}: ${error.message}`
            );
            throw error;
        }
    }

    /**
     * CreateToken generates a LiveKit access token
     *
     * @param roomId - Room ID
     * @param userInfo - NatsKvUserInfo object
     * @returns JWT token string
     */
    async createToken(roomId: string, userInfo: NatsKvUserInfo): Promise<string> {
        const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
        const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

        if (!apiKey || !apiSecret) {
            throw new Error('LiveKit API key or secret not configured');
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: userInfo.userId,
            name: userInfo.name,
            metadata: JSON.stringify(userInfo),
        });

        // Set video grant permissions
        at.addGrant({
            roomJoin: true,
            room: roomId,
            canPublish: userInfo.isPresenter,
            canSubscribe: true,
            canPublishData: true,
            hidden: false,
            recorder: userInfo.userId === 'RECORDER_BOT' || userInfo.name === 'RECORDER_BOT', // Simple check, refine if needed
        });

        // Add admin grant if applicable
        if (userInfo.isAdmin) {
            // LiveKit doesn't have explicit "admin" grant in same way, 
            // but we can set permission appropriately or rely on metadata
        }

        return at.toJwt();
    }

    /**
     * Get the underlying RoomServiceClient for advanced operations
     */
    getClient(): RoomServiceClient {
        return this.client;
    }
}
