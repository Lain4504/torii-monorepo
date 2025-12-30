import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards, Request, Ip, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('rbac')
export class RBACGatewayController {
    constructor(
        @Inject('NATS_SERVICE') private readonly authClient: ClientProxy,
    ) { }

    @Get('roles')
    async getRoles() {
        return this.authClient.send({ cmd: 'rbac.getRoles' }, {});
    }

    @Get('permissions')
    async getPermissions() {
        return this.authClient.send({ cmd: 'rbac.getPermissions' }, {});
    }

    @Get('roles/:roleCode/permissions')
    async getRolePermissions(@Param('roleCode') roleCode: string) {
        return this.authClient.send({ cmd: 'rbac.getRolePermissions' }, { roleCode });
    }

    @Put('roles/:roleCode/permissions')
    async updateRolePermissions(
        @Param('roleCode') roleCode: string,
        @Body() body: any,
        @Request() req,
        @Ip() ip: string,
    ) {
        return this.authClient.send(
            { cmd: 'rbac.updateRolePermissions' },
            {
                roleCode,
                permissions: body.permissions,
                user: req.user,
                ip,
                userAgent: req.headers?.['user-agent'],
            },
        );
    }

    @Post('reseed')
    async reseed() {
        return this.authClient.send({ cmd: 'rbac.reseed' }, {});
    }
}

@Controller('admin/audit-logs')
export class AuditLogGatewayController {
    constructor(
        @Inject('NATS_SERVICE') private readonly authClient: ClientProxy,
    ) { }

    @Get()
    async getAuditLogs(@Query() query: any) {
        return this.authClient.send({ cmd: 'auditLog.query' }, query);
    }
}
