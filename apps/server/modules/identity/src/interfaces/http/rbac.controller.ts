
import { Controller, Get, Put, Post, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { GatewayAuthGuard } from '@server/shared';
import { UserRole } from '@workspace/schemas';
import { RBACService } from '../../modules/rbac/rbac.service';
import { RBACConfigService } from '../../modules/rbac/rbac-config.service';
import { RBACSeederService } from '../../modules/rbac/rbac-seeder.service';

@Controller('rbac')
@UseGuards(GatewayAuthGuard)
export class RBACController {
    private readonly logger = new Logger(RBACController.name);

    constructor(
        private readonly rbacService: RBACService,
        private readonly rbacConfig: RBACConfigService,
        private readonly seeder: RBACSeederService,
    ) { }

    @Get('roles')
    async getRoles() {
        const roles = this.rbacConfig.getRoles();
        return {
            success: true,
            data: roles,
        };
    }

    @Get('permissions')
    async getPermissions() {
        const permissions = this.rbacConfig.getPermissions();

        // Group by category
        const grouped = permissions.reduce((acc, perm) => {
            if (!acc[perm.category]) {
                acc[perm.category] = [];
            }
            acc[perm.category].push(perm);
            return acc;
        }, {} as Record<string, typeof permissions>);

        return {
            success: true,
            data: {
                all: permissions,
                byCategory: grouped,
            },
        };
    }

    @Get('roles/:roleCode/permissions')
    async getRolePermissions(@Param('roleCode') roleCode: string) {
        try {
            const permissions = await this.rbacService.getRolePermissions(roleCode);

            return {
                success: true,
                data: {
                    roleCode,
                    permissions,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Put('roles/:roleCode/permissions')
    async setRolePermissions(
        @Param('roleCode') roleCode: string,
        @Body() data: { permissions: string[] }
    ) {
        try {
            this.logger.log(`Set permissions for role ${roleCode}`);

            await this.rbacService.setRolePermissions(roleCode, data.permissions);

            return {
                success: true,
                message: `Updated permissions for role ${roleCode}`,
                data: { roleCode, permissions: data.permissions },
            };
        } catch (error) {
            this.logger.error(`Error updating permissions: ${error.message} `);
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Post('reseed')
    async reseedPermissions() {
        try {
            const result = await this.seeder.reseedNewPermissions();
            return {
                success: true,
                message: 'Re-seeding complete',
                data: result,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
}
