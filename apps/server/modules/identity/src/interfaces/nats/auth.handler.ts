import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IAuthService, ISessionService } from '../../interfaces/services';
import { AUTH_SERVICE_TOKEN, SESSION_SERVICE_TOKEN } from '../../interfaces/services';
import type {
    UserRegistrationDTO,
    UserLoginDTO,
    VerifyOTPDTO,
    ResendOTPDTO,
    ForgotPasswordDTO,
    LogoutDTO,
} from '@workspace/schemas';

@Controller()
export class AuthHandler {
    private readonly logger = new Logger(AuthHandler.name);

    constructor(
        @Inject(AUTH_SERVICE_TOKEN) private readonly authService: IAuthService,
        @Inject(SESSION_SERVICE_TOKEN) private readonly sessionService: ISessionService,
    ) { }

    @MessagePattern({ cmd: 'identity.auth.register' })
    async register(@Payload() dto: UserRegistrationDTO) {
        return this.authService.register(dto);
    }

    @MessagePattern({ cmd: 'identity.auth.login' })
    async login(@Payload() dto: UserLoginDTO) {
        return this.authService.login(dto);
    }

    @MessagePattern({ cmd: 'identity.auth.adminLogin' })
    async adminLogin(@Payload() dto: UserLoginDTO) {
        return this.authService.adminLogin(dto);
    }

    @MessagePattern({ cmd: 'identity.auth.verify2FA' })
    async verify2FA(@Payload() data: { tempToken: string; code: string; backupCode: boolean }) {
        return this.authService.verify2FA(data.tempToken, data.code, data.backupCode);
    }

    @MessagePattern({ cmd: 'identity.auth.googleAuth' })
    async googleAuth(@Payload() data: { idToken: string }) {
        return this.authService.registerWithGoogle(data.idToken);
    }

    @MessagePattern({ cmd: 'identity.session.create' })
    async createSession(@Payload() data: { userId: string; ipAddress?: string; userAgent?: string }) {
        return this.sessionService.createSession(data.userId, {
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
        });
    }

    @MessagePattern({ cmd: 'identity.auth.refreshToken' })
    async refreshToken(@Payload() data: { refreshToken: string; ipAddress?: string; userAgent?: string }) {
        // Verify refresh token
        const payload = await this.sessionService.verifySession(data.refreshToken);
        if (!payload) {
            throw new Error('Invalid or expired refresh token');
        }

        // Get user
        const user = await this.authService.getCurrentUser(payload.sub);
        if (!user) {
            throw new Error('User not found');
        }

        // Revoke old session
        const tokenHash = this.sessionService.hashTokenPublic(data.refreshToken);
        await this.sessionService.revokeSession(tokenHash);

        // Generate new tokens
        const accessToken = await this.authService.generateAccessToken(user.id, user.role);
        const refreshToken = await this.sessionService.createSession(user.id, {
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
        });

        return { user, accessToken, refreshToken };
    }

    @MessagePattern({ cmd: 'identity.auth.logout' })
    async logout(@Payload() data: { accessToken: string | null; refreshToken: string | null }) {
        await this.authService.logout(data.accessToken, data.refreshToken);
        return { success: true };
    }

    @MessagePattern({ cmd: 'identity.auth.linkGoogle' })
    async linkGoogle(@Payload() data: { userId: string; idToken: string }) {
        return this.authService.linkGoogleAccount(data.userId, data.idToken);
    }

    @MessagePattern({ cmd: 'identity.auth.unlinkProvider' })
    async unlinkProvider(@Payload() data: { userId: string; provider: string }) {
        return this.authService.unlinkProvider(data.userId, data.provider);
    }

    @MessagePattern({ cmd: 'identity.auth.getLinkedProviders' })
    async getLinkedProviders(@Payload() data: { userId: string }) {
        return this.authService.getLinkedProviders(data.userId);
    }

    // User Profile Management
    @MessagePattern({ cmd: 'identity.auth.me' })
    async getMe(@Payload() data: { userId: string }) {
        return this.authService.getCurrentUser(data.userId);
    }

    @MessagePattern({ cmd: 'identity.auth.updateMe' })
    async updateMe(@Payload() data: { userId: string; dto: { displayName?: string } }) {
        return this.authService.updateUser(data.userId, data.dto);
    }

    @MessagePattern({ cmd: 'identity.auth.deleteMe' })
    async deleteMe(@Payload() data: { userId: string }) {
        return this.authService.deleteUser(data.userId);
    }

    // Email & Password Management
    @MessagePattern({ cmd: 'identity.auth.resendVerification' })
    async resendVerification(@Payload() data: { email: string }) {
        return this.authService.resendVerification(data.email);
    }

    @MessagePattern({ cmd: 'identity.auth.verifyEmail' })
    async verifyEmail(@Payload() data: { token: string }) {
        return this.authService.verifyVerificationToken(data.token);
    }

    @MessagePattern({ cmd: 'identity.auth.forgotPassword' })
    async forgotPassword(@Payload() dto: ForgotPasswordDTO) {
        return this.authService.forgotPassword(dto);
    }

    @MessagePattern({ cmd: 'identity.auth.verifyOTP' })
    async verifyOTP(@Payload() dto: VerifyOTPDTO) {
        return this.authService.verifyOTP(dto);
    }

    @MessagePattern({ cmd: 'identity.auth.resendOTP' })
    async resendOTP(@Payload() dto: ResendOTPDTO) {
        return this.authService.resendOTP(dto);
    }

    @MessagePattern({ cmd: 'identity.auth.verifyResetToken' })
    async verifyResetToken(@Payload() data: { token: string }) {
        return this.authService.verifyResetToken(data.token);
    }

    @MessagePattern({ cmd: 'identity.auth.resetPassword' })
    async resetPassword(@Payload() data: { token: string; password: string }) {
        return this.authService.resetPassword(data.token, data.password);
    }

    // Invite Management
    @MessagePattern({ cmd: 'identity.auth.verifyInviteToken' })
    async verifyInviteToken(@Payload() data: { token: string }) {
        return this.authService.verifyInviteToken(data.token);
    }

    @MessagePattern({ cmd: 'identity.auth.setPassword' })
    async setPassword(@Payload() data: { token: string; password: string }) {
        return this.authService.setPassword(data.token, data.password);
    }
}
