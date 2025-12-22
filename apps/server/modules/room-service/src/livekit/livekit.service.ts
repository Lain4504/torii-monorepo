/**
 * LiveKit Service
 * Equivalent to Go: plugNmeet-server/pkg/services/livekit/user.go
 * 
 * Handles LiveKit participant operations
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoomServiceClient } from 'livekit-server-sdk';

/**
 * LiveKitService handles participant operations with LiveKit server
 * Equivalent to Go: LivekitService in user.go
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
     * Equivalent to Go: s.LoadParticipants
     * 
     * @param roomId - The room ID to load participants from
     * @returns Array of ParticipantInfo or null
     */
    async loadParticipants(roomId: string): Promise<any[] | null> {
        try {
            this.logger.debug(`Loading participants for room: ${roomId}`);

            // Equivalent to Go: s.lkc.ListParticipants(ctx, &req)
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
     * Equivalent to Go: s.LoadParticipantInfo
     * 
     * @param roomId - The room ID
     * @param identity - The participant identity
     * @returns ParticipantInfo or throws error
     */
    async loadParticipantInfo(roomId: string, identity: string): Promise<any> {
        try {
            this.logger.debug(`Loading participant info: ${identity} in room: ${roomId}`);

            // Equivalent to Go: s.lkc.GetParticipant(ctx, &req)
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
     * Equivalent to Go: s.RemoveParticipant
     * 
     * @param roomId - The room ID
     * @param userId - The user/participant identity to remove
     * @returns RemoveParticipantResponse
     */
    async removeParticipant(roomId: string, userId: string): Promise<any> {
        try {
            this.logger.log(`Removing participant: ${userId} from room: ${roomId}`);

            // Equivalent to Go: s.lkc.RemoveParticipant(ctx, &data)
            const response = await this.client.removeParticipant(roomId, userId);

            this.logger.log(`Successfully removed participant: ${userId} from room: ${roomId}`);
            return response;
        } catch (error) {
            this.logger.error(`Failed to remove participant ${userId} from room ${roomId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get the underlying RoomServiceClient for advanced operations
     */
    getClient(): RoomServiceClient {
        return this.client;
    }
}
