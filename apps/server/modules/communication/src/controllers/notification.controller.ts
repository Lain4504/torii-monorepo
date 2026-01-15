import { Controller, Get, Post, Delete, Body, Param, Query, Logger, UseGuards, Req, Patch, Inject } from '@nestjs/common';
import type {
    NotificationQueryDTO,
    NotificationCreateDTO,
} from '@workspace/schemas';
import type { INotificationService } from '../interfaces/services';
import { NOTIFICATION_SERVICE_TOKEN } from '../interfaces/services';
import { GatewayAuthGuard } from '@server/shared';

@Controller('notifications')
@UseGuards(GatewayAuthGuard)
export class NotificationController {
    private readonly logger = new Logger(NotificationController.name);

    constructor(
        @Inject(NOTIFICATION_SERVICE_TOKEN)
        private readonly notificationService: INotificationService,
    ) { }

    @Get()
    async findAll(
        @Req() req: any,
        @Query() query: NotificationQueryDTO,
    ) {
        const userId = req.user?.sub || req.user?.uid;
        this.logger.log(`Finding notifications for user: ${userId}`);
        return await this.notificationService.findAll(userId, query);
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: any) {
        const userId = req.user?.sub || req.user?.uid;
        return await this.notificationService.getUnreadCount(userId);
    }

    @Patch(':id/read')
    async markAsRead(
        @Param('id') notificationId: string,
        @Req() req: any,
    ) {
        const userId = req.user?.sub || req.user?.uid;
        return await this.notificationService.markAsRead(notificationId, userId);
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: any) {
        const userId = req.user?.sub || req.user?.uid;
        return await this.notificationService.markAllAsRead(userId);
    }

    @Delete(':id')
    async delete(
        @Param('id') notificationId: string,
        @Req() req: any,
    ) {
        const userId = req.user?.sub || req.user?.uid;
        return await this.notificationService.delete(notificationId, userId);
    }

    @Post()
    async create(@Body() payload: NotificationCreateDTO) {
        return await this.notificationService.create(payload);
    }
}
