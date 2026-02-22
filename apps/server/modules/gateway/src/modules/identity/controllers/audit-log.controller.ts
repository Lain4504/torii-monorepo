import { Controller, Get, Post, Query, Body, UseGuards, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { successResponse, errorResponse, successPaginatedResponse, GatewayAuthGuard, ZodValidationPipe } from '@server/shared';
import { auditLogFiltersDTOSchema } from '@workspace/schemas';
import type { AuditLogFiltersDTO } from '@workspace/schemas';

@Controller('api/admin/audit-logs')
@UseGuards(GatewayAuthGuard)
export class AuditLogController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('search')
    async getAuditLogs(
        @Body(new ZodValidationPipe(auditLogFiltersDTOSchema)) dto: AuditLogFiltersDTO,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.audit.query' },
                    dto,
                ),
            );
            return successPaginatedResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch audit logs');
        }
    }

    @Post('user/:userId/search')
    async getUserActivity(
        @Param('userId') userId: string,
        @Body() dto: { limit?: number },
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.audit.getUserActivity' },
                    { userId, limit: dto.limit ?? 20 },
                ),
            );
            return successResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch user activity');
        }
    }

    @Post('entity/:entity/:entityId/search')
    async getEntityActivity(
        @Param('entity') entity: string,
        @Param('entityId') entityId: string,
        @Body() dto: { limit?: number },
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.audit.getEntityActivity' },
                    {
                        entity,
                        entityId,
                        limit: dto.limit ?? 20,
                    },
                ),
            );
            return successResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch entity activity');
        }
    }
}
