import type { AuditContextDTO } from '@workspace/schemas';

/**
 * User Permissions Response
 */
export interface UserPermissions {
    permissions: string[];
}

/**
 * RBAC Service Interface
 * Defines the contract for Role-Based Access Control operations
 */
export interface IRBACService {
    /**
     * Get all permissions for a user based on their role and custom permissions
     * Reads from database (role_permissions + user_permissions)
     * @param userId - The user's unique identifier
     * @param userRole - The user's role
     * @returns User permissions
     */
    getUserPermissions(userId: string, userRole: string): Promise<UserPermissions>;

    /**
     * Check if user has a specific permission
     * @param userId - The user's unique identifier
     * @param userRole - The user's role
     * @param permissionCode - The permission code to check
     * @returns True if user has the permission, false otherwise
     */
    hasPermission(userId: string, userRole: string, permissionCode: string): Promise<boolean>;

    /**
     * Get permissions for a role (from database)
     * @param roleCode - The role code
     * @returns Array of permission codes
     */
    getRolePermissions(roleCode: string): Promise<string[]>;

    /**
     * Set permissions for a role (replaces all existing) - ADMIN only
     * @param roleCode - The role code
     * @param permissionCodes - Array of permission codes to set
     * @param context - Optional audit context
     */
    setRolePermissions(
        roleCode: string,
        permissionCodes: string[],
        context?: AuditContextDTO,
    ): Promise<void>;

    /**
     * Add single permission to a role - ADMIN only
     * @param roleCode - The role code
     * @param permissionCode - The permission code to add
     */
    addPermissionToRole(roleCode: string, permissionCode: string): Promise<void>;

    /**
     * Remove permission from a role - ADMIN only
     * @param roleCode - The role code
     * @param permissionCode - The permission code to remove
     */
    removePermissionFromRole(roleCode: string, permissionCode: string): Promise<void>;

    /**
     * Add custom permission to a user (override) - ADMIN only
     * @param userId - The user's unique identifier
     * @param permissionCode - The permission code to grant
     * @param context - Optional audit context
     */
    grantPermissionToUser(
        userId: string,
        permissionCode: string,
        context?: AuditContextDTO,
    ): Promise<void>;

    /**
     * Revoke permission from a user - ADMIN only
     * @param userId - The user's unique identifier
     * @param permissionCode - The permission code to revoke
     * @param context - Optional audit context
     */
    revokePermissionFromUser(
        userId: string,
        permissionCode: string,
        context?: AuditContextDTO,
    ): Promise<void>;

    /**
     * Get all available roles from config (for admin UI)
     * @returns Array of available roles with their metadata
     */
    getAvailableRoles(): any;

    /**
     * Get all available permissions from config (for admin UI)
     * @returns Array of available permissions with their metadata
     */
    getAvailablePermissions(): any;
}
