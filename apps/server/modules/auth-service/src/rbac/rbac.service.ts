import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { RBACConfigService } from './rbac-config.service';

export interface UserPermissions {
    permissions: string[];
}

@Injectable()
export class RBACService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly rbacConfig: RBACConfigService,
    ) { }

    /**
     * Get all permissions for a user based on their role and custom permissions
     * Reads from DATABASE (role_permissions + user_permissions)
     */
    async getUserPermissions(userId: string, userRole: string): Promise<UserPermissions> {
        // Admin wildcard check
        if (userRole === 'admin') {
            return { permissions: ['*'] };
        }

        // Get role permissions from DATABASE
        const rolePerms = await this.prisma.rolePermission.findMany({
            where: { roleCode: userRole },
        });

        // Get user-specific custom permissions from DATABASE
        const userPerms = await this.prisma.userPermission.findMany({
            where: {
                userId: userId,
                isGranted: true,
            },
        });

        // Combine role permissions and custom permissions
        const allPermissions = [
            ...rolePerms.map((rp) => rp.permissionCode),
            ...userPerms.map((up) => up.permissionCode),
        ];

        return {
            permissions: Array.from(new Set(allPermissions)), // Remove duplicates
        };
    }

    /**
     * Check if user has a specific permission
     */
    async hasPermission(userId: string, userRole: string, permissionCode: string): Promise<boolean> {
        const { permissions } = await this.getUserPermissions(userId, userRole);

        // Check for wildcard permission
        if (permissions.includes('*')) {
            return true;
        }

        return permissions.includes(permissionCode);
    }

    /**
     * Get permissions for a role (from DB)
     */
    async getRolePermissions(roleCode: string): Promise<string[]> {
        if (roleCode === 'admin') {
            return ['*'];
        }

        const rolePerms = await this.prisma.rolePermission.findMany({
            where: { roleCode },
        });

        return rolePerms.map((rp) => rp.permissionCode);
    }

    /**
     * ADMIN: Set permissions for a role (replaces all existing)
     */
    async setRolePermissions(roleCode: string, permissionCodes: string[]): Promise<void> {
        // Validate role exists in config
        const role = this.rbacConfig.getRoleByCode(roleCode);
        if (!role) {
            throw new Error(`Role ${roleCode} not found in RBAC config`);
        }

        // Validate all permissions exist in config
        for (const permCode of permissionCodes) {
            if (permCode === '*') continue; // Allow wildcard
            if (!this.rbacConfig.isValidPermission(permCode)) {
                throw new Error(`Permission ${permCode} not found in RBAC config`);
            }
        }

        // Delete all existing permissions for this role
        await this.prisma.rolePermission.deleteMany({
            where: { roleCode },
        });

        // Insert new permissions
        if (permissionCodes.length > 0 && permissionCodes[0] !== '*') {
            await this.prisma.rolePermission.createMany({
                data: permissionCodes.map((permCode) => ({
                    roleCode,
                    permissionCode: permCode,
                })),
            });
        }
    }

    /**
     * ADMIN: Add single permission to a role
     */
    async addPermissionToRole(roleCode: string, permissionCode: string): Promise<void> {
        // Validate
        if (!this.rbacConfig.getRoleByCode(roleCode)) {
            throw new Error(`Role ${roleCode} not found`);
        }
        if (!this.rbacConfig.isValidPermission(permissionCode)) {
            throw new Error(`Permission ${permissionCode} not found`);
        }

        await this.prisma.rolePermission.upsert({
            where: {
                roleCode_permissionCode: { roleCode, permissionCode },
            },
            create: { roleCode, permissionCode },
            update: {},
        });
    }

    /**
     * ADMIN: Remove permission from a role
     */
    async removePermissionFromRole(roleCode: string, permissionCode: string): Promise<void> {
        await this.prisma.rolePermission.deleteMany({
            where: { roleCode, permissionCode },
        });
    }

    /**
     * ADMIN: Add custom permission to a user (override)
     */
    async grantPermissionToUser(userId: string, permissionCode: string): Promise<void> {
        // Validate permission exists in config
        if (!this.rbacConfig.isValidPermission(permissionCode)) {
            throw new Error(`Permission ${permissionCode} not found in RBAC config`);
        }

        await this.prisma.userPermission.upsert({
            where: {
                userId_permissionCode: {
                    userId,
                    permissionCode,
                },
            },
            create: {
                userId,
                permissionCode,
                isGranted: true,
            },
            update: {
                isGranted: true,
            },
        });
    }

    /**
     * ADMIN: Revoke permission from a user
     */
    async revokePermissionFromUser(userId: string, permissionCode: string): Promise<void> {
        await this.prisma.userPermission.deleteMany({
            where: {
                userId,
                permissionCode,
            },
        });
    }

    /**
     * Get all available roles from config (for admin UI)
     */
    getAvailableRoles() {
        return this.rbacConfig.getRoles();
    }

    /**
     * Get all available permissions from config (for admin UI)
     */
    getAvailablePermissions() {
        return this.rbacConfig.getPermissions();
    }
}
