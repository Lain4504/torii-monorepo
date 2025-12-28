import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';
import { notificationQueryDTOSchema } from '@workspace/schemas';
import type {
  NotificationQueryDTO,
  NotificationResponseDTO,
  NotificationMarkAsReadRequestDTO,
  NotificationMarkAllAsReadRequestDTO,
  NotificationDeleteRequestDTO,
  NotificationUnreadCountResponseDTO,
  PaginatedResponse,
} from '@workspace/schemas';

@Controller('api/notifications')
export class NotificationController {
  private readonly MOCK_USER_ID = '5e808603-1e54-4dc9-ae93-f1e347c101ab';
  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(notificationQueryDTOSchema))
  async findAll(
    @Query() queryDTO: NotificationQueryDTO,
  ): Promise<PaginatedResponse<NotificationResponseDTO>> {
    const userId = this.MOCK_USER_ID;
    try {
      const response = await lastValueFrom<PaginatedResponse<NotificationResponseDTO>>(
        this.natsClient.send({ cmd: 'notification.findAll' }, { userId, query: queryDTO }),
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
  ): Promise<NotificationResponseDTO> {
    const userId = this.MOCK_USER_ID;
    try {
      const payload: NotificationMarkAsReadRequestDTO = {
        notificationId: id,
        userId,
      };

      const response = await lastValueFrom<NotificationResponseDTO>(
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
      const payload: NotificationMarkAllAsReadRequestDTO = {
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
  async getUnreadCount(): Promise<NotificationUnreadCountResponseDTO> {
    const userId = this.MOCK_USER_ID;
    try {
      const response = await lastValueFrom<NotificationUnreadCountResponseDTO>(
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
      const payload: NotificationDeleteRequestDTO = {
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


