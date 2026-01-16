import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    Req,
    Inject,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    ZodValidationPipe,
    successResponse,
    errorResponse,
    successPaginatedResponse,
    GatewayAuthGuard,
} from '@server/shared';
import {
    NotificationQueryDTO,
    notificationQueryDTOSchema,
    NotificationCreateDTO,
    notificationCreateDTOSchema,
} from '@workspace/schemas';

@Controller('api/notifications')
@UseGuards(GatewayAuthGuard)
export class NotificationController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    @UsePipes(new ZodValidationPipe(notificationQueryDTOSchema)) // Optional: if query validation is needed here
    async findAll(
        @Req() req: any,
        @Query() query: NotificationQueryDTO,
    ) {
        try {
            const userId = req.user?.sub || req.user?.uid;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'communication.notification.findAll' },
                    { userId, query },
                ),
            );
            // The service returns PaginatedResponseDTO. existing users controller behaves as if this needs wrapping.
            // But verify if successPaginatedResponse is compatible with what service returns.
            // If service returns { data: [], meta: {} }, successPaginatedResponse({ data: [], meta: {} }) -> { success: true, data: { data: [], meta: {} } }
            // This matches strict frontend expectation of response.data.success.
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error?.message || 'Failed to fetch notifications');
        }
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: any) {
        try {
            const userId = req.user?.sub || req.user?.uid;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'communication.notification.getUnreadCount' },
                    { userId },
                ),
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error?.message || 'Failed to get unread count');
        }
    }

    @Patch(':id/read')
    async markAsRead(
        @Param('id') notificationId: string,
        @Req() req: any,
    ) {
        try {
            const userId = req.user?.sub || req.user?.uid;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'communication.notification.markAsRead' },
                    { notificationId, userId },
                ),
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error?.message || 'Failed to mark notification as read');
        }
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: any) {
        try {
            const userId = req.user?.sub || req.user?.uid;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'communication.notification.markAllAsRead' },
                    { userId },
                ),
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error?.message || 'Failed to mark all as read');
        }
    }

    @Delete(':id')
    async delete(
        @Param('id') notificationId: string,
        @Req() req: any,
    ) {
        try {
            const userId = req.user?.sub || req.user?.uid;
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'communication.notification.delete' },
                    { notificationId, userId },
                ),
            );
            return successResponse(null, 'Notification deleted successfully');
        } catch (error: any) {
            return errorResponse(error?.message || 'Failed to delete notification');
        }
    }

    @Post()
    @UsePipes(new ZodValidationPipe(notificationCreateDTOSchema))
    async create(@Body() payload: NotificationCreateDTO) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'communication.notification.create' },
                    payload,
                ),
            );
            return successResponse(result, 'Notification created successfully');
        } catch (error: any) {
            return errorResponse(error?.message || 'Failed to create notification');
        }
    }
}
