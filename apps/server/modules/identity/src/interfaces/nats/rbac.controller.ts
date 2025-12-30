import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RBACService } from '../../modules/rbac/rbac.service';
import { RBACConfigService } from '../../modules/rbac/rbac-config.service';
import { RBACSeederService } from '../../modules/rbac/rbac-seeder.service';

@Controller()
export class RBACController {
    private readonly logger = new Logger(RBACController.name);

    constructor(
        private readonly rbacService: RBACService,
        private readonly rbacConfig: RBACConfigService,
        private readonly seeder: RBACSeederService,
    ) { }

    @MessagePattern({ cmd: 'rbac.getRoles' })
    async getRoles() {
        const roles = this.rbacConfig.getRoles();
        return {
            success: true,
            data: roles,
        };
    }

    @MessagePattern({ cmd: 'rbac.getPermissions' })
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

    @MessagePattern({ cmd: 'rbac.getRolePermissions' })
    async getRolePermissions(@Payload() data: { roleCode: string }) {
        try {
            const permissions = await this.rbacService.getRolePermissions(data.roleCode);

            return {
                success: true,
                data: {
                    roleCode: data.roleCode,
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

    @MessagePattern({ cmd: 'rbac.updateRolePermissions' })
    async setRolePermissions(@Payload() data: { roleCode: string, permissions: string[], user?: any, ip?: string, userAgent?: string }) {
        try {
            this.logger.log(`Set permissions for role ${data.roleCode}`);

            const context = data.user ? {
                actorId: data.user.sub,
                actorEmail: data.user.email,
                actorRole: data.user.role,
                ipAddress: data.ip,
                userAgent: data.userAgent,
            } : undefined;

            await this.rbacService.setRolePermissions(data.roleCode, data.permissions, context);

            return {
                success: true,
                message: `Updated permissions for role ${data.roleCode}`,
                data: { roleCode: data.roleCode, permissions: data.permissions },
            };
        } catch (error) {
            this.logger.error(`Error updating permissions: ${error.message}`);
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @MessagePattern({ cmd: 'rbac.reseed' })
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

    // Additional methods converted to NATS patterns for completeness, though not explicitly called by current gateway

    @MessagePattern({ cmd: 'rbac.addPermissionToRole' })
    async addPermissionToRole(@Payload() data: { roleCode: string, permissionCode: string }) {
        try {
            await this.rbacService.addPermissionToRole(data.roleCode, data.permissionCode);
            return {
                success: true,
                message: `Added ${data.permissionCode} to ${data.roleCode}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @MessagePattern({ cmd: 'rbac.removePermissionFromRole' })
    async removePermissionFromRole(@Payload() data: { roleCode: string, permissionCode: string }) {
        try {
            await this.rbacService.removePermissionFromRole(data.roleCode, data.permissionCode);
            return {
                success: true,
                message: `Removed ${data.permissionCode} from ${data.roleCode}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @MessagePattern({ cmd: 'rbac.grantUserPermission' })
    async grantUserPermission(@Payload() data: { userId: string, permissionCode: string, user?: any, ip?: string, userAgent?: string }) {
        try {
            const context = data.user ? {
                actorId: data.user.sub,
                actorEmail: data.user.email,
                actorRole: data.user.role,
                ipAddress: data.ip,
                userAgent: data.userAgent,
            } : undefined;

            await this.rbacService.grantPermissionToUser(data.userId, data.permissionCode, context);
            return {
                success: true,
                message: `Granted ${data.permissionCode} to user ${data.userId}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @MessagePattern({ cmd: 'rbac.revokeUserPermission' })
    async revokeUserPermission(@Payload() data: { userId: string, permissionCode: string, user?: any, ip?: string, userAgent?: string }) {
        try {
            const context = data.user ? {
                actorId: data.user.sub,
                actorEmail: data.user.email,
                actorRole: data.user.role,
                ipAddress: data.ip,
                userAgent: data.userAgent,
            } : undefined;

            await this.rbacService.revokePermissionFromUser(data.userId, data.permissionCode, context);
            return {
                success: true,
                message: `Revoked ${data.permissionCode} from user ${data.userId}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
}
