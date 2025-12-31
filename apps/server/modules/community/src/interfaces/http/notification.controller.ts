import { Controller, Get, Post, Delete, Body, Param, Query, Logger, UseGuards, Req, Patch } from '@nestjs/common';
import type {
    NotificationQueryDTO,
    NotificationCreateDTO,
    NotificationMarkAsReadRequestDTO,
    NotificationMarkAllAsReadRequestDTO,
    NotificationDeleteRequestDTO,
} from '@workspace/schemas';
import { NotificationService } from '../../modules/notification/notification.service';
import { FirebaseAuthGuard } from '@server/shared';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationController {
    private readonly logger = new Logger(NotificationController.name);

    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    async findAll(
        @Req() req: any,
        @Query() query: NotificationQueryDTO,
    ) {
        const userId = req.user.uid;
        this.logger.log(`Finding notifications for user: ${userId}`);
        return await this.notificationService.findAll(userId, query);
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: any) {
        const userId = req.user.uid;
        return await this.notificationService.getUnreadCount(userId);
    }

    @Patch(':id/read')
    async markAsRead(
        @Param('id') notificationId: string,
        @Req() req: any,
    ) {
        const userId = req.user.uid;
        return await this.notificationService.markAsRead(notificationId, userId);
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: any) {
        const userId = req.user.uid;
        return await this.notificationService.markAllAsRead(userId);
    }

    @Delete(':id')
    async delete(
        @Param('id') notificationId: string,
        @Req() req: any,
    ) {
        const userId = req.user.uid;
        return await this.notificationService.delete(notificationId, userId);
    }

    // Usually notifications are created by system, but if we have an endpoint for manual creation:
    @Post()
    async create(@Body() payload: NotificationCreateDTO) {
        return await this.notificationService.create(payload);
    }
}
