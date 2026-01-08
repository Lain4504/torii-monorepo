import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IAuthorizationService } from '../interfaces/services';
import { AUTHORIZATION_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Authorization NATS Message Handler
 * Handles inter-service communication for permission checks
 * 
 * @example
 * // From other service:
 * this.natsClient.send('identity.authorization.checkPermission', { userId, permission }).toPromise();
 */
@Controller()
export class AuthorizationMessagingController {
    constructor(
        @Inject(AUTHORIZATION_SERVICE_TOKEN)
        private readonly authorizationService: IAuthorizationService,
    ) { }

    /**
     * Check if user has specific permission
     * Pattern: identity.authorization.checkPermission
     */
    @MessagePattern('identity.authorization.checkPermission')
    async checkPermission(
        @Payload() data: { userId: string; userRole: string; permission: string }
    ) {
        try {
            const hasPermission = await this.authorizationService.hasPermission(
                data.userId,
                data.userRole,
                data.permission
            );
            return {
                success: true,
                hasPermission,
            };
        } catch (error: unknown) {
            return {
                success: false,
                hasPermission: false,
                error: (error instanceof Error ? error.message : 'Unknown error'),
            };
        }
    }

    /**
     * Get all permissions for user role
     * Pattern: identity.authorization.getUserPermissions
     */
    @MessagePattern('identity.authorization.getUserPermissions')
    async getUserPermissions(
        @Payload() data: { userId: string; role: string }
    ) {
        try {
            const result = await this.authorizationService.getUserPermissions(
                data.userId,
                data.role
            );
            return {
                success: true,
                data: result,
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: (error instanceof Error ? error.message : 'Unknown error'),
            };
        }
    }

    /**
     * Check multiple permissions at once
     * Pattern: identity.authorization.checkMultiplePermissions
     */
    @MessagePattern('identity.authorization.checkMultiplePermissions')
    async checkMultiplePermissions(
        @Payload() data: { userId: string; userRole: string; permissions: string[] }
    ) {
        try {
            const results = await Promise.all(
                data.permissions.map(permission =>
                    this.authorizationService.hasPermission(data.userId, data.userRole, permission)
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
        } catch (error: unknown) {
            return {
                success: false,
                error: (error instanceof Error ? error.message : 'Unknown error'),
            };
        }
    }
}

