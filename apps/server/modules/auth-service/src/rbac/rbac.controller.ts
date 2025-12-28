import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { RBACConfigService } from './rbac-config.service';
import { RBACSeederService } from './rbac-seeder.service';

// TODO: Add authentication guard
// @UseGuards(AuthGuard, AdminGuard)
@Controller('rbac')
export class RBACController {
    constructor(
        private readonly rbacService: RBACService,
        private readonly rbacConfig: RBACConfigService,
        private readonly seeder: RBACSeederService,
    ) { }

    /**
     * Get all available roles (from YAML config)
     * Used in admin UI to show role list
     */
    @Get('roles')
    async getRoles() {
        const roles = this.rbacConfig.getRoles();
        return {
            success: true,
            data: roles,
        };
    }

    /**
     * Get all available permissions (from YAML config)
     * Used in admin UI to show permission list
     */
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

    /**
     * Get permissions assigned to a specific role (from DB)
     */
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

    /**
     * Update permissions for a role (replaces all)
     * Admin can check/uncheck permissions in UI
     */
    @Put('roles/:roleCode/permissions')
    async setRolePermissions(
        @Param('roleCode') roleCode: string,
        @Body('permissions') permissions: string[],
    ) {
        try {
            await this.rbacService.setRolePermissions(roleCode, permissions);

            return {
                success: true,
                message: `Updated permissions for role ${roleCode}`,
                data: { roleCode, permissions },
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    /**
     * Add single permission to a role
     */
    @Post('roles/:roleCode/permissions/:permissionCode')
    async addPermissionToRole(
        @Param('roleCode') roleCode: string,
        @Param('permissionCode') permissionCode: string,
    ) {
        try {
            await this.rbacService.addPermissionToRole(roleCode, permissionCode);

            return {
                success: true,
                message: `Added ${permissionCode} to ${roleCode}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    /**
     * Remove permission from a role
     */
    @Delete('roles/:roleCode/permissions/:permissionCode')
    async removePermissionFromRole(
        @Param('roleCode') roleCode: string,
        @Param('permissionCode') permissionCode: string,
    ) {
        try {
            await this.rbacService.removePermissionFromRole(roleCode, permissionCode);

            return {
                success: true,
                message: `Removed ${permissionCode} from ${roleCode}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    /**
     * Grant permission override to a specific user
     */
    @Post('users/:userId/permissions/:permissionCode')
    async grantUserPermission(
        @Param('userId') userId: string,
        @Param('permissionCode') permissionCode: string,
    ) {
        try {
            await this.rbacService.grantPermissionToUser(userId, permissionCode);

            return {
                success: true,
                message: `Granted ${permissionCode} to user ${userId}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    /**
     * Revoke permission from a specific user
     */
    @Delete('users/:userId/permissions/:permissionCode')
    async revokeUserPermission(
        @Param('userId') userId: string,
        @Param('permissionCode') permissionCode: string,
    ) {
        try {
            await this.rbacService.revokePermissionFromUser(userId, permissionCode);

            return {
                success: true,
                message: `Revoked ${permissionCode} from user ${userId}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    /**
     * Manual trigger to re-seed new permissions from YAML
     * Call this after adding new permissions to YAML config
     */
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
