import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IRBACService } from '../interfaces/services';
import { RBAC_SERVICE_TOKEN } from '../interfaces/services';

/**
 * RBAC NATS Message Handler
 * Handles inter-service communication for permission checks
 * 
 * @example
 * // From other service:
 * this.natsClient.send('identity.rbac.checkPermission', { userId, permission }).toPromise();
 */
@Controller()
export class RBACMessagingController {
    constructor(
        @Inject(RBAC_SERVICE_TOKEN)
        private readonly rbacService: IRBACService,
    ) { }

    /**
     * Check if user has specific permission
     * Pattern: identity.rbac.checkPermission
     */
    @MessagePattern('identity.rbac.checkPermission')
    async checkPermission(
        @Payload() data: { userId: string; userRole: string; permission: string }
    ) {
        try {
            const hasPermission = await this.rbacService.hasPermission(
                data.userId,
                data.userRole,
                data.permission
            );
            return {
                success: true,
                hasPermission,
            };
        } catch (error: any) {
            return {
                success: false,
                hasPermission: false,
                error: error.message,
            };
        }
    }

    /**
     * Get all permissions for user role
     * Pattern: identity.rbac.getUserPermissions
     */
    @MessagePattern('identity.rbac.getUserPermissions')
    async getUserPermissions(
        @Payload() data: { userId: string; role: string }
    ) {
        try {
            const result = await this.rbacService.getUserPermissions(
                data.userId,
                data.role
            );
            return {
                success: true,
                data: result,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Check multiple permissions at once
     * Pattern: identity.rbac.checkMultiplePermissions
     */
    @MessagePattern('identity.rbac.checkMultiplePermissions')
    async checkMultiplePermissions(
        @Payload() data: { userId: string; userRole: string; permissions: string[] }
    ) {
        try {
            const results = await Promise.all(
                data.permissions.map(permission =>
                    this.rbacService.hasPermission(data.userId, data.userRole, permission)
                )
            );

            const permissionMap = data.permissions.reduce((acc, perm, index) => {
                acc[perm] = results[index];
                return acc;
            }, {} as Record<string, boolean>);

            return {
                success: true,
                permissions: permissionMap,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}
