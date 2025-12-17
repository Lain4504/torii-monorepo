import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '@server/shared';
import { NatsMsgServerToClientEvents } from '@server/proto';

@Injectable()
export class UserTrackingService {
  private readonly logger = new Logger(UserTrackingService.name);

  constructor(private readonly natsService: NatsService) {}

  /**
   * Called when user connects to NATS websocket
   * Marks user as online and broadcasts USER_JOINED event
   */
  async onAfterUserJoined(roomId: string, userId: string) {
    this.logger.log(`User ${userId} joined room ${roomId}`);

    try {
      // Check current status
      this.logger.debug(`Checking current status for ${userId}...`);
      const currentStatus = await this.natsService.getRoomUserStatus(
        roomId,
        userId,
      );
      this.logger.debug(`Current status for ${userId}: '${currentStatus}'`);

      // Always update to online and broadcast
      // Don't skip even if already 'online' - user may have reconnected
      this.logger.log(`Updating ${userId} status to 'online'...`);
      await this.natsService.updateUserStatus(roomId, userId, 'online');
      this.logger.debug(`Status updated successfully for ${userId}`);

      // Get full user info
      this.logger.debug(`Fetching user info for ${userId}...`);
      const userInfo = await this.natsService.getUserInfo(roomId, userId);
      if (!userInfo || !userInfo.userId) {
        this.logger.warn(`User info not found for ${userId} after join`);
        return;
      }
      this.logger.debug(`User info fetched: ${JSON.stringify(userInfo)}`);

      // Broadcast USER_JOINED to all other users
      this.logger.log(`Broadcasting USER_JOINED for ${userId}...`);
      await this.broadcastUserJoined(roomId, userId, userInfo);

      this.logger.log(`Successfully processed user joined: ${userId}`);
    } catch (error) {
      this.logger.error(`Error in onAfterUserJoined: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
    }
  }

  /**
   * Called when user disconnects from NATS websocket
   * Marks user as disconnected and broadcasts USER_DISCONNECTED
   */
  async onAfterUserDisconnected(roomId: string, userId: string) {
    this.logger.log(`User ${userId} disconnected from room ${roomId}`);

    try {
      // Immediately mark as disconnected
      await this.natsService.updateUserStatus(roomId, userId, 'disconnected');

      // Get user info for broadcast
      const userInfo = await this.natsService.getUserInfo(roomId, userId);

      // Broadcast disconnected event
      await this.broadcastUserDisconnected(roomId, userId, userInfo);

      // Start delayed offline handling (wait for reconnect)
      setTimeout(
        () => this.handleDelayedOffline(roomId, userId, userInfo),
        5000,
      );
    } catch (error) {
      this.logger.error(`Error in onAfterUserDisconnected: ${error.message}`);
    }
  }

  private async handleDelayedOffline(
    roomId: string,
    userId: string,
    userInfo: any,
  ) {
    try {
      // Check if user reconnected
      const status = await this.natsService.getRoomUserStatus(roomId, userId);
      if (status === 'online') {
        this.logger.log(`User ${userId} reconnected, skipping offline`);
        return;
      }

      // Mark as offline
      await this.natsService.updateUserStatus(roomId, userId, 'offline');

      // Broadcast offline event
      await this.broadcastUserOffline(roomId, userId, userInfo);

      // Wait more before cleanup
      setTimeout(() => this.cleanupUserResources(roomId, userId), 30000);
    } catch (error) {
      this.logger.error(`Error in handleDelayedOffline: ${error.message}`);
    }
  }

  private async cleanupUserResources(roomId: string, userId: string) {
    try {
      // Check one more time if user reconnected
      const status = await this.natsService.getRoomUserStatus(roomId, userId);
      if (status === 'online') {
        this.logger.log(`User ${userId} reconnected before cleanup, skipping`);
        return;
      }

      // Delete NATS consumers
      await this.natsService.deleteConsumers(roomId, userId);
      this.logger.log(`Cleaned up resources for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error cleaning up user resources: ${error.message}`);
    }
  }

  private async broadcastUserJoined(
    roomId: string,
    userId: string,
    userInfo: any,
  ) {
    try {
      this.logger.log(
        `Broadcasting USER_JOINED for ${userId} in room ${roomId}`,
      );
      await this.natsService.broadcastSystemEventToEveryoneExceptUserId(
        NatsMsgServerToClientEvents.USER_JOINED,
        roomId,
        JSON.stringify(userInfo), // MUST be JSON string for NATS encoding
        userId,
      );
      this.logger.log(`Successfully broadcasted USER_JOINED for ${userId}`);
    } catch (error) {
      this.logger.error(`Error broadcasting USER_JOINED: ${error.message}`);
    }
  }

  private async broadcastUserDisconnected(
    roomId: string,
    userId: string,
    userInfo: any,
  ) {
    try {
      this.logger.log(`Broadcasting USER_DISCONNECTED for ${userId}`);
      await this.natsService.broadcastSystemEventToEveryoneExceptUserId(
        NatsMsgServerToClientEvents.USER_DISCONNECTED,
        roomId,
        JSON.stringify(userInfo || { userId, roomId }),
        userId,
      );
    } catch (error) {
      this.logger.error(
        `Error broadcasting USER_DISCONNECTED: ${error.message}`,
      );
    }
  }

  private async broadcastUserOffline(
    roomId: string,
    userId: string,
    userInfo: any,
  ) {
    try {
      this.logger.log(`Broadcasting USER_OFFLINE for ${userId}`);
      await this.natsService.broadcastSystemEventToEveryoneExceptUserId(
        NatsMsgServerToClientEvents.USER_OFFLINE,
        roomId,
        JSON.stringify(userInfo || { userId }),
        userId,
      );
    } catch (error) {
      this.logger.error(`Error broadcasting USER_OFFLINE: ${error.message}`);
    }
  }
}
