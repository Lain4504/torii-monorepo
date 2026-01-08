import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IUsersService } from '../interfaces/services';
import { USERS_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Users NATS Message Handler
 * Handles inter-service communication for user operations
 * 
 * @example
 * // From other service:
 * this.natsClient.send('identity.users.getUserById', userId).toPromise();
 */
@Controller()
export class UsersMessagingController {
    constructor(
        @Inject(USERS_SERVICE_TOKEN)
        private readonly usersService: IUsersService,
    ) { }

    /**
     * Get user by ID (called from other services)
     * Pattern: identity.users.getUserById
     */
    @MessagePattern('identity.users.getUserById')
    async getUserById(@Payload() userId: string) {
        try {
            const user = await this.usersService.findOne(userId);
            return {
                success: true,
                data: user,
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: (error instanceof Error ? error.message : 'Unknown error'),
            };
        }
    }

    /**
     * Verify if user exists
     * Pattern: identity.users.verifyUser
     */
    @MessagePattern('identity.users.verifyUser')
    async verifyUser(@Payload() data: { userId: string }) {
        try {
            const user = await this.usersService.findOne(data.userId);
            return {
                success: true,
                exists: !!user,
                user: user || null,
            };
        } catch (error: unknown) {
            return {
                success: false,
                exists: false,
                error: (error instanceof Error ? error.message : 'Unknown error'),
            };
        }
    }

    /**
     * Get multiple users by IDs
     * Pattern: identity.users.getBulk
     */
    @MessagePattern('identity.users.getBulk')
    async getBulkUsers(@Payload() userIds: string[]) {
        try {
            // TODO: Implement bulk fetch in UsersService
            const users = await Promise.all(
                userIds.map(id => this.usersService.findOne(id).catch(() => null))
            );

            return {
                success: true,
                data: users.filter(u => u !== null),
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: (error instanceof Error ? error.message : 'Unknown error'),
                data: [],
            };
        }
    }

    /**
     * Get user with permissions (for other services)
     * Pattern: identity.users.getUserWithPermissions
     */
    @MessagePattern('identity.users.getUserWithPermissions')
    async getUserWithPermissions(@Payload() userId: string) {
        try {
            const user = await this.usersService.getUserWithPermissions(userId);
            return {
                success: true,
                data: user,
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: (error instanceof Error ? error.message : 'Unknown error'),
            };
        }
    }
}
