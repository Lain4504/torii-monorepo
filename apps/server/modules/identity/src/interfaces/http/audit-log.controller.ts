import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GatewayAuthGuard } from '@server/shared';
import type { AuditLogFiltersDTO } from '@workspace/schemas';
import { AuditLogService } from "../../modules/audit";

@UseGuards(GatewayAuthGuard)
@Controller('admin/audit-logs')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    /**
     * Get audit logs with pagination and filters
     */
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
        const filters: AuditLogFiltersDTO = {
            userId,
            action,
            entity,
            entityId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 50,
        };

        const result = await this.auditLogService.query(filters);

        return {
            success: true,
            data: result,
        };
    }

    /**
     * Get recent activity for a specific user
     */
    @Get('user/:userId')
    async getUserActivity(
        @Query('userId') userId: string,
        @Query('limit') limit?: string,
    ) {
        const activity = await this.auditLogService.getUserActivity(
            userId,
            limit ? parseInt(limit, 10) : 20,
        );

        return {
            success: true,
            data: activity,
        };
    }

    /**
     * Get activity history for a specific entity
     */
    @Get('entity/:entity/:entityId')
    async getEntityActivity(
        @Query('entity') entity: string,
        @Query('entityId') entityId: string,
        @Query('limit') limit?: string,
    ) {
        const activity = await this.auditLogService.getEntityActivity(
            entity,
            entityId,
            limit ? parseInt(limit, 10) : 20,
        );

        return {
            success: true,
            data: activity,
        };
    }
}
