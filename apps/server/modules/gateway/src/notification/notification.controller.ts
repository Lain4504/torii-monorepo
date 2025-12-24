import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  NotificationQueryDto,
  NotificationListResponseDto,
  NotificationResponseDto,
  MarkAsReadRequestDto,
  MarkAllAsReadRequestDto,
  DeleteNotificationRequestDto,
  UnreadCountResponseDto,
} from '@workspace/dtos';

@Controller('api/notifications')
export class NotificationController {
  private readonly MOCK_USER_ID = '5e808603-1e54-4dc9-ae93-f1e347c101ab';
  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isRead') isRead?: string,
  ): Promise<NotificationListResponseDto> {
    const userId = this.MOCK_USER_ID;
    try {
      const query: NotificationQueryDto = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        ...(isRead !== undefined && { isRead: isRead === 'true' }),
      };

      const response = await lastValueFrom<NotificationListResponseDto>(
        this.natsClient.send({ cmd: 'notification.findAll' }, { userId, query }),
      );

      return response;
    } catch (error: any) {
      console.error('Gateway: Error in notification.findAll:', error);
      throw error;
    }
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    const userId = this.MOCK_USER_ID;
    try {
      const payload: MarkAsReadRequestDto = {
        notificationId: id,
        userId,
      };

      const response = await lastValueFrom<NotificationResponseDto>(
        this.natsClient.send({ cmd: 'notification.markAsRead' }, payload),
      );

      return response;
    } catch (error: any) {
      console.error('Gateway: Error in notification.markAsRead:', error);
      throw error;
    }
  }

  @Patch('read-all')
  async markAllAsRead(): Promise<{ success: boolean; message: string; count: number }> {
    const userId = this.MOCK_USER_ID;
    try {
      const payload: MarkAllAsReadRequestDto = {
        userId,
      };

      const response = await lastValueFrom<{ success: boolean; message: string; count: number }>(
        this.natsClient.send({ cmd: 'notification.markAllAsRead' }, payload),
      );

      return response;
    } catch (error: any) {
      console.error('Gateway: Error in notification.markAllAsRead:', error);
      throw error;
    }
  }

  @Get('unread-count')
  async getUnreadCount(): Promise<UnreadCountResponseDto> {
    const userId = this.MOCK_USER_ID;
    try {
      const response = await lastValueFrom<UnreadCountResponseDto>(
        this.natsClient.send({ cmd: 'notification.getUnreadCount' }, { userId }),
      );

      return response;
    } catch (error: any) {
      console.error('Gateway: Error in notification.getUnreadCount:', error);
      throw error;
    }
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    const userId = this.MOCK_USER_ID;
    try {
      const payload: DeleteNotificationRequestDto = {
        notificationId: id,
        userId,
      };

      const response = await lastValueFrom<{ success: boolean; message: string }>(
        this.natsClient.send({ cmd: 'notification.delete' }, payload),
      );

      return response;
    } catch (error: any) {
      console.error('Gateway: Error in notification.delete:', error);
      throw error;
    }
  }
}


