import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { successResponse, errorResponse, successPaginatedResponse } from '@server/shared';
import { IdentityAuthGuard } from '../guards/identity-auth.guard';

@Controller('api/admin/audit-logs')
@UseGuards(IdentityAuthGuard)
export class AuditLogController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async getAuditLogs(
        @Query('userId') userId?: string,
        @Query('action') action?: string,
        @Query('entity') entity?: string,
        @Query('entityId') entityId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.audit.query' },
                    {
                        userId,
                        action,
                        entity,
                        entityId,
                        startDate,
                        endDate,
                        page: page ? parseInt(page, 10) : 1,
                        limit: limit ? parseInt(limit, 10) : 50,
                    },
                ),
            );
            return successPaginatedResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch audit logs');
        }
    }

    @Get('user/:userId')
    async getUserActivity(
        @Query('userId') userId: string,
        @Query('limit') limit?: string,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.audit.getUserActivity' },
                    { userId, limit: limit ? parseInt(limit, 10) : 20 },
                ),
            );
            return successResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch user activity');
        }
    }

    @Get('entity/:entity/:entityId')
    async getEntityActivity(
        @Query('entity') entity: string,
        @Query('entityId') entityId: string,
        @Query('limit') limit?: string,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.audit.getEntityActivity' },
                    {
                        entity,
                        entityId,
                        limit: limit ? parseInt(limit, 10) : 20,
                    },
                ),
            );
            return successResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch entity activity');
        }
    }
}
