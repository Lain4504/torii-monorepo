/**
 * User Controller (Room Service)
 * Handles NATS messages from Gateway's auth-room.controller.ts
 * 
 * Controller layer - only handles NATS routing, delegates to RoomUserService
 */

import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomUserService } from './room-user.service';
import type {
    UpdateUserLockSettingsReq,
    MuteUnMuteTrackReq,
    SwitchPresenterReq,
} from '@workspace/protocol';

/**
 * UserController receives NATS messages for user operations within rooms
 * Delegates all business logic to RoomUserService
 * 
 * Pattern: Gateway (auth-room.controller.ts) → NATS → UserController → RoomUserService
 */
@Controller()
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly roomUserService: RoomUserService) { }

    /**
     * Check if user is in block list
     * Pattern: user.isUserInBlockList
     * From: auth-room.controller.ts line 92
     */
    @MessagePattern({ cmd: 'user.isUserInBlockList' })
    async isUserInBlockList(@Payload() data: { roomId: string; userId: string }) {
        return this.roomUserService.isUserInBlockList(data.roomId, data.userId);
    }

    /**
     * Check user status (online/offline)
     * Pattern: room.getUserStatus
     * From: gateway.controller.ts
     */
    @MessagePattern('room.getUserStatus')
    async getUserStatus(@Payload() data: { roomId: string; userId: string }) {
        return this.roomUserService.getUserStatus(data.roomId, data.userId);
    }

    /**
     * Generate join token for a user
     * Pattern: user.generateJoinToken
     * From: auth-room.controller.ts line 122
     * 
     */
    @MessagePattern({ cmd: 'user.generateJoinToken' })
    async generateJoinToken(@Payload() data: any) {
        return this.roomUserService.getWajlcJoinToken(data);
    }

    /**
     * Update user lock settings
     * Pattern: user.updateLockSettings
     * From: auth-room.controller.ts line 211
     * 
     */
    @MessagePattern({ cmd: 'user.updateLockSettings' })
    async updateLockSettings(@Payload() data: UpdateUserLockSettingsReq) {
        // Map to service interface (proto now uses snake_case, generates camelCase)
        const mappedData = {
            roomId: data.roomId,
            userId: data.userId,
            service: data.service,
            direction: data.direction as 'lock' | 'unlock',
            requestedUserId: data.requestedUserId,  // ✅ Now matches generated type
        };
        return this.roomUserService.updateUserLockSettings(mappedData);
    }

    /**
     * Mute/unmute user track
     * Pattern: user.muteUnMuteTrack
     * From: auth-room.controller.ts line 282
     * 
     */
    @MessagePattern({ cmd: 'user.muteUnMuteTrack' })
    async muteUnMuteTrack(@Payload() data: MuteUnMuteTrackReq) {
        // Map to service interface (proto now uses snake_case, generates camelCase)
        const mappedData = {
            roomId: data.roomId,
            userId: data.userId,
            trackSid: data.trackSid,
            muted: data.muted,
            requestedUserId: data.requestedUserId,  // ✅ Now matches generated type
        };
        return this.roomUserService.handleMuteUnMuteTrack(mappedData);
    }

    /**
     * Remove participant from room
     * Pattern: user.removeParticipant
     * From: auth-room.controller.ts line 356
     * 
     */
    @MessagePattern({ cmd: 'user.removeParticipant' })
    async removeParticipant(@Payload() data: { sid: string; roomId: string; userId: string; msg?: string; blockUser?: boolean }) {
        return this.roomUserService.handleRemoveParticipant(data);
    }

    /**
     * Switch presenter in room
     * Pattern: user.switchPresenter
     * From: auth-room.controller.ts line 405
     * 
     */
    @MessagePattern({ cmd: 'user.switchPresenter' })
    async switchPresenter(@Payload() data: SwitchPresenterReq) {
        // Map to service interface (proto now uses snake_case, generates camelCase)
        const mappedData = {
            roomId: data.roomId,
            userId: data.userId,
            task: data.task,
            requestedUserId: data.requestedUserId,  // ✅ Now matches generated type
        };
        return this.roomUserService.handleSwitchPresenter(mappedData);
    }
}
