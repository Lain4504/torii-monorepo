import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { AuthorizationConfigService } from './authorization-config.service';
import type { IAuditLogService, IAuthorizationService, RoleMetadata, PermissionMetadata } from '../../interfaces/services';
import { AUDIT_LOG_SERVICE_TOKEN } from '../../interfaces/services';
import type { AuditContextDTO } from '@workspace/schemas';

export interface UserPermissions {
    permissions: string[];
}

// Type alias for backward compatibility
export type AuditContext = AuditContextDTO;

@Injectable()
export class AuthorizationService implements IAuthorizationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly authorizationConfig: AuthorizationConfigService,
        @Inject(AUDIT_LOG_SERVICE_TOKEN) private readonly auditLog: IAuditLogService,
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

        // Simplified: Strictly Role-Based Access Control
        // No user-specific overrides
        const allPermissions = rolePerms.map((rp) => rp.permissionCode);

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
    async setRolePermissions(
        roleCode: string,
        permissionCodes: string[],
        context?: AuditContextDTO,
    ): Promise<void> {
        // Validate role exists in config
        const role = this.authorizationConfig.getRoleByCode(roleCode);
        if (!role) {
            throw new Error(`Role ${roleCode} not found in authorization config`);
        }

        // Validate all permissions exist in config
        for (const permCode of permissionCodes) {
            if (permCode === '*') continue; // Allow wildcard
            if (!this.authorizationConfig.isValidPermission(permCode)) {
                throw new Error(`Permission ${permCode} not found in authorization config`);
            }
        }

        // Get old permissions for audit log
        const oldPermissions = await this.getRolePermissions(roleCode);

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

        // Audit log
        if (context) {
            await this.auditLog.log({
                userId: context.actorId,
                userEmail: context.actorEmail,
                userRole: context.actorRole,
                action: 'permission.update_role',
                entity: 'role_permission',
                entityId: roleCode,
                description: `Updated permissions for role "${role.name}" (${roleCode})`,
                metadata: {
                    roleCode,
                    roleName: role.name,
                    permissionCount: permissionCodes.length,
                },
                oldValues: { permissions: oldPermissions },
                newValues: { permissions: permissionCodes },
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
            });
        }
    }

    /**
     * ADMIN: Add single permission to a role
     */
    async addPermissionToRole(roleCode: string, permissionCode: string): Promise<void> {
        // Validate
        if (!this.authorizationConfig.getRoleByCode(roleCode)) {
            throw new Error(`Role ${roleCode} not found`);
        }
        if (!this.authorizationConfig.isValidPermission(permissionCode)) {
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
     * Get all available roles from config (for admin UI)
     */
    getAvailableRoles(): RoleMetadata[] {
        return this.authorizationConfig.getRoles().map(role => ({
            code: role.code,
            name: role.name,
            description: role.description,
        }));
    }

    /**
     * Get all available permissions from config (for admin UI)
     */
    getAvailablePermissions(): PermissionMetadata[] {
        return this.authorizationConfig.getPermissions().map(perm => ({
            code: perm.code,
            name: perm.code, // Use code as name if name not available
            description: perm.description,
            category: perm.category,
        }));
    }
}

