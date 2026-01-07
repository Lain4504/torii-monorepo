import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IAuthService } from '../interfaces/services';
import { AUTH_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Auth NATS Message Handler
 * Handles inter-service communication for authentication operations
 * 
 * @example
 * // From other service:
 * this.natsClient.send('identity.auth.validateToken', token).toPromise();
 */
@Controller()
export class AuthMessagingController {
    constructor(
        @Inject(AUTH_SERVICE_TOKEN)
        private readonly authService: IAuthService,
    ) { }

    /**
     * Get user profile (internal service call)
     * Pattern: identity.auth.getProfile
     */
    @MessagePattern('identity.auth.getProfile')
    async getProfile(@Payload() userId: string) {
        try {
            const profile = await this.authService.getCurrentUser(userId);
            return {
                success: true,
                data: profile,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get linked OAuth providers for user
     * Pattern: identity.auth.getLinkedProviders
     */
    @MessagePattern('identity.auth.getLinkedProviders')
    async getLinkedProviders(@Payload() userId: string) {
        try {
            const providers = await this.authService.getLinkedProviders(userId);
            return {
                success: true,
                data: providers,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Verify if email exists
     * Pattern: identity.auth.verifyEmail
     */
    @MessagePattern('identity.auth.verifyEmail')
    async verifyEmail(@Payload() email: string) {
        try {
            // This would need a new method in AuthService
            // For now, returning placeholder
            return {
                success: true,
                exists: false, // TODO: Implement
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}
