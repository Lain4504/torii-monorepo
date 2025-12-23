/**
 * User Controller (Room Service)
 * Handles NATS messages from Gateway's auth-room.controller.ts
 * 
 * Controller layer - only handles NATS routing, delegates to RoomUserService
 */

import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomUserService } from './room-user.service';

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
     * Generate join token for a user
     * Pattern: user.generateJoinToken
     * From: auth-room.controller.ts line 122
     * 
     * Delegates to: RoomUserService.getPNMJoinToken (matches Go: UserModel.GetPNMJoinToken)
     */
    @MessagePattern({ cmd: 'user.generateJoinToken' })
    async generateJoinToken(@Payload() data: any) {
        return this.roomUserService.getPNMJoinToken(data);
    }

    /**
     * Update user lock settings
     * Pattern: user.updateLockSettings
     * From: auth-room.controller.ts line 211
     * 
     * Delegates to: RoomUserService.updateUserLockSettings (matches Go: HandleUpdateUserLockSetting)
     */
    @MessagePattern({ cmd: 'user.updateLockSettings' })
    async updateLockSettings(@Payload() data: any) {
        return this.roomUserService.updateUserLockSettings(data);
    }

    /**
     * Mute/unmute user track
     * Pattern: user.muteUnMuteTrack
     * From: auth-room.controller.ts line 282
     * 
     * Delegates to: RoomUserService.handleMuteUnMuteTrack (matches Go: HandleMuteUnMuteTrack)
     */
    @MessagePattern({ cmd: 'user.muteUnMuteTrack' })
    async muteUnMuteTrack(@Payload() data: any) {
        return this.roomUserService.handleMuteUnMuteTrack(data);
    }

    /**
     * Remove participant from room
     * Pattern: user.removeParticipant
     * From: auth-room.controller.ts line 356
     * 
     * Delegates to: RoomUserService.handleRemoveParticipant (matches Go: HandleRemoveParticipant)
     */
    @MessagePattern({ cmd: 'user.removeParticipant' })
    async removeParticipant(@Payload() data: { sid: string; userId: string; msg?: string; blockUser?: boolean }) {
        return this.roomUserService.handleRemoveParticipant(data);
    }

    /**
     * Switch presenter in room
     * Pattern: user.switchPresenter
     * From: auth-room.controller.ts line 405
     * 
     * Delegates to: RoomUserService.handleSwitchPresenter (matches Go: HandleSwitchPresenter)
     */
    @MessagePattern({ cmd: 'user.switchPresenter' })
    async switchPresenter(@Payload() data: any) {
        return this.roomUserService.handleSwitchPresenter(data);
    }
}
