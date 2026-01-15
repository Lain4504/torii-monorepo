import { Body, Controller, Delete, Get, Patch, Post, Request, UseGuards, Res, HttpCode, HttpStatus, UnauthorizedException, Query, BadRequestException, Inject } from '@nestjs/common';
import type { Response } from 'express';
import { GatewayAuthGuard, VerifiedOnly, successResponse, errorResponse, Public } from '@server/shared';
import type { IAuthService, ISessionService } from '../interfaces/services';
import { AUTH_SERVICE_TOKEN, SESSION_SERVICE_TOKEN } from '../interfaces/services';
import type { ReqWithRequester, UserRegistrationDTO, UserLoginDTO, VerifyOTPDTO, ResendOTPDTO, ForgotPasswordDTO, LoginResponseDTO, LogoutDTO } from '@workspace/schemas';
import { logoutDTOSchema } from '@workspace/schemas';
import { ZodValidationPipe } from '@server/shared';

/**
 * Auth HTTP Controller
 * Handles authentication and user profile management with refresh token support
 */
@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE_TOKEN) private readonly authService: IAuthService,
        @Inject(SESSION_SERVICE_TOKEN) private readonly sessionService: ISessionService,
    ) { }

    /**
     * Register a new user
     * POST /auth/register
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() dto: UserRegistrationDTO) {
        try {
            const user = await this.authService.register(dto);
            return successResponse(
                { user },
                'Registration successful. Please check your email to verify your account.'
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Registration failed'
            );
        }
    }

    /**
     * Resend verification email
     * POST /auth/resend-verification
     */
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    async resendVerification(@Body('email') email: string) {
        if (!email) {
            throw new BadRequestException('Email is required');
        }

        try {
            await this.authService.resendVerification(email);
            return successResponse(null, 'Verification email sent');
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to resend verification email'
            );
        }
    }

    /**
     * Verify email with magic link token
     * POST /auth/verify-email
     */
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body('token') token: string) {
        if (!token) {
            throw new BadRequestException('Token is required');
        }

        try {
            const result = await this.authService.verifyVerificationToken(token);

            if (!result.success) {
                return errorResponse('Invalid or expired verification link');
            }

            return successResponse(
                { email: result.email },
                'Email verified successfully'
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Verification failed'
            );
        }
    }

    // ========================================
    // Password Reset Endpoints
    // ========================================

    /**
     * Request password reset
     * POST /auth/forgot-password
     */
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(
        @Body() dto: ForgotPasswordDTO,
        @Request() req
    ) {
        // Fallback for platform if not in DTO but in header
        const platform = dto.platform || req.headers['x-platform'] || 'web';

        try {
            await this.authService.forgotPassword({ ...dto, platform });
            return successResponse(
                null,
                platform === 'mobile'
                    ? 'If an account exists, a 6-digit OTP has been sent.'
                    : 'If an account exists, a password reset link has been sent.'
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to process password reset request'
            );
        }
    }

    /**
     * Verify OTP code (Mobile)
     * POST /auth/verify-otp
     */
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOTP(@Body() dto: VerifyOTPDTO) {
        try {
            const result = await this.authService.verifyOTP(dto);

            if (!result.success) {
                return errorResponse('Invalid or expired verification code');
            }

            return successResponse(
                {
                    email: result.email,
                    tempToken: result.tempToken
                },
                'OTP verified successfully'
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Verification failed'
            );
        }
    }

    /**
     * Resend OTP code (Mobile)
     * POST /auth/resend-otp
     */
    @Post('resend-otp')
    @HttpCode(HttpStatus.OK)
    async resendOTP(@Body() dto: ResendOTPDTO) {
        try {
            await this.authService.resendOTP(dto);
            return successResponse(null, 'New verification code has been sent');
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to resend code'
            );
        }
    }


    /**
     * Verify reset password token
     * POST /auth/verify-reset-token
     */
    @Post('verify-reset-token')
    @HttpCode(HttpStatus.OK)
    async verifyResetToken(@Body('token') token: string) {
        if (!token) {
            throw new BadRequestException('Token is required');
        }

        try {
            const result = await this.authService.verifyResetToken(token);

            if (!result.success) {
                return errorResponse('Invalid or expired reset token');
            }

            return successResponse(
                { email: result.email },
                'Reset token is valid'
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Token verification failed'
            );
        }
    }

    /**
     * Reset password with token
     * POST /auth/reset-password
     */
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body('token') token: string,
        @Body('password') password: string,
    ) {
        if (!token || !password) {
            throw new BadRequestException('Token and new password are required');
        }

        // Validate password strength
        if (password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters long');
        }

        try {
            await this.authService.resetPassword(token, password);
            return successResponse(
                null,
                'Password has been reset successfully. You can now login with your new password.'
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to reset password'
            );
        }
    }

    /**
     * Specialized login for admin portals
     * Validates that the user has administrative privileges (ADMIN, STAFF, LECTURER)
     * Rejects users with LEARNER role.
     * 
     * POST /auth/admin/login
     * @param dto Login credentials
     * @param req Request object for metadata
     * @param res Response object for cookie management
     */
    @Post('admin/login')
    @HttpCode(HttpStatus.OK)
    async adminLogin(
        @Body() dto: UserLoginDTO,
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.adminLogin(dto);
        return await this.handleLoginResult(result, req, res);
    }

    /**
     * Login user
     * POST /auth/login
     * 
     * Now supports 2FA - returns requiresTwoFactor if 2FA is enabled
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: UserLoginDTO,
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.login(dto);
        return await this.handleLoginResult(result, req, res);
    }

    /**
     * Core logic for handling login result (F1)
     * Handles 2FA requirements and session generation
     */
    private async handleLoginResult(result: LoginResponseDTO, req: { ip?: string; headers: Record<string, string | undefined> }, res: Response) {
        // Check if 2FA is required
        if (result.requiresTwoFactor) {
            return successResponse(
                {
                    requiresTwoFactor: true,
                    twoFactorMethod: result.twoFactorMethod,
                    tempToken: result.tempToken,
                },
                result.twoFactorMethod === 'totp'
                    ? 'Enter code from your authenticator app'
                    : `Verification code sent to your ${result.twoFactorMethod}`
            );
        }

        // No 2FA - proceed with normal login
        const { user, accessToken } = result;

        // Generate refresh token
        const refreshToken = await this.sessionService.createSession(user!.id, {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        // Check Platform
        const platform = req.headers['x-platform'];

        const userData = {
            id: user!.id,
            email: user!.email,
            displayName: user!.displayName,
            role: user!.role,
            verifiedAt: user!.verifiedAt,
        };

        if (platform === 'mobile') {
            // Mobile: Return tokens in body
            return successResponse({
                access_token: accessToken,
                refresh_token: refreshToken,
                user: userData
            });
        } else {
            // Web: Set httpOnly cookies
            this.setAuthCookies(res, accessToken!, refreshToken);

            return successResponse({
                user: userData
            });
        }
    }

    /**
     * Verify 2FA code and complete login
     * POST /auth/login/verify-2fa
     */
    @Post('login/verify-2fa')
    @HttpCode(HttpStatus.OK)
    async verify2FA(
        @Body('tempToken') tempToken: string,
        @Body('code') code: string,
        @Body('backupCode') backupCode: boolean = false,
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        if (!tempToken || !code) {
            throw new BadRequestException('Temporary token and code are required');
        }

        try {
            const { user, accessToken } = await this.authService.verify2FA(tempToken, code, backupCode);

            // Generate refresh token
            const refreshToken = await this.sessionService.createSession(user.id, {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });

            // Check Platform
            const platform = req.headers['x-platform'];

            if (platform === 'mobile') {
                // Mobile: Return tokens in body
                return successResponse({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        displayName: user.displayName,
                        role: user.role,
                        verifiedAt: user.verifiedAt,
                    }
                });
            } else {
                // Web: Set httpOnly cookies
                this.setAuthCookies(res, accessToken, refreshToken);

                return successResponse({
                    user: {
                        id: user.id,
                        email: user.email,
                        displayName: user.displayName,
                        role: user.role,
                        verifiedAt: user.verifiedAt,
                    }
                });
            }
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : '2FA verification failed'
            );
        }
    }

    /**
     * Login/Register with Google OAuth
     * POST /auth/google
     */
    @Post('google')
    @HttpCode(HttpStatus.OK)
    async googleAuth(
        @Body('idToken') idToken: string,
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        if (!idToken) {
            throw new BadRequestException('Google ID token is required');
        }

        try {
            const { user, accessToken } = await this.authService.registerWithGoogle(idToken);

            // Generate refresh token
            const refreshToken = await this.sessionService.createSession(user.id, {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });

            // Check Platform
            const platform = req.headers['x-platform'];

            if (platform === 'mobile') {
                return successResponse({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        displayName: user.displayName,
                        role: user.role,
                        verifiedAt: user.verifiedAt,
                    }
                });
            } else {
                // Web: Set httpOnly cookies
                this.setAuthCookies(res, accessToken, refreshToken);

                return successResponse({
                    user: {
                        id: user.id,
                        email: user.email,
                        displayName: user.displayName,
                        role: user.role,
                        verifiedAt: user.verifiedAt,
                    }
                });
            }
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Google authentication failed'
            );
        }
    }

    /**
     * Link Google account to existing user
     * POST /auth/link/google
     */
    @Post('link/google')
    @UseGuards(GatewayAuthGuard)
    @HttpCode(HttpStatus.OK)
    async linkGoogle(
        @Request() req: ReqWithRequester,
        @Body('idToken') idToken: string
    ) {
        if (!idToken) {
            throw new BadRequestException('Google ID token is required');
        }

        try {
            await this.authService.linkGoogleAccount(req.requester.sub, idToken);
            return successResponse(
                { provider: 'google' },
                'Google account linked successfully'
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to link Google account'
            );
        }
    }

    /**
     * Unlink OAuth provider
     * DELETE /auth/link/:provider
     */
    @Delete('link/:provider')
    @UseGuards(GatewayAuthGuard)
    @HttpCode(HttpStatus.OK)
    async unlinkProvider(
        @Request() req: ReqWithRequester,
        @Query('provider') provider: string
    ) {
        if (!provider) {
            throw new BadRequestException('Provider is required');
        }

        try {
            await this.authService.unlinkProvider(req.requester.sub, provider);
            return successResponse(
                null,
                `${provider} account unlinked successfully`
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to unlink provider'
            );
        }
    }

    /**
     * Get linked providers for authenticated user
     * GET /auth/linked-providers
     */
    @Get('linked-providers')
    @UseGuards(GatewayAuthGuard)
    async getLinkedProviders(@Request() req: ReqWithRequester) {
        try {
            const providers = await this.authService.getLinkedProviders(req.requester.sub);
            return successResponse({ providers });
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get linked providers'
            );
        }
    }

    /**
     * Refresh access token using refresh token
     * POST /auth/refresh
     * 
     * Token Rotation: Issues new refresh token and revokes old one
     * Supports both Cookie (Web) and Body (Mobile) transport
     */
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
        // Try getting token from Cookie (Web) or Body (Mobile)
        const oldRefreshToken = req.cookies?.refresh_token || req.body?.refresh_token;

        if (!oldRefreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }

        // Verify refresh token
        const payload = await this.sessionService.verifySession(oldRefreshToken);

        if (!payload) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Get user from database token
        const user = await this.authService.getCurrentUser(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Revoke old refresh token (rotation)
        const tokenHash = this.sessionService.hashTokenPublic(oldRefreshToken);
        await this.sessionService.revokeSession(tokenHash);

        // Generate new tokens
        const newAccessToken = await this.authService.generateAccessToken(user.id, user.role);
        const newRefreshToken = await this.sessionService.createSession(user.id, {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        // Check Platform
        const platform = req.headers['x-platform'];

        if (platform === 'mobile') {
            // Mobile: Return tokens in body
            return successResponse({
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            });
        } else {
            // Web: Set httpOnly cookies
            this.setAuthCookies(res, newAccessToken, newRefreshToken);

            return successResponse(null, 'Token refreshed successfully');
        }
    }

    /**
     * Logout user
     * POST /auth/logout
     * 
     * Blacklists access token and revokes refresh token session
     * Works with both valid and expired tokens
     * 
     * Supports:
     * - Web: Tokens from cookies
     * - Mobile: Access token from Authorization header, refresh token from body
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Body() dto: LogoutDTO,
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        // Extract tokens: support both web (cookies) and mobile (header + body)
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies?.access_token || null;

        const refreshToken = req.cookies?.refresh_token || dto.refreshToken || null;

        // Revoke tokens (handles both valid and expired tokens)
        await this.authService.logout(accessToken, refreshToken);

        const cookieOptions = this.getCookieOptions();

        // Clear cookies regardless of token validity
        res.clearCookie('access_token', cookieOptions);
        res.clearCookie('refresh_token', cookieOptions);

        return successResponse(null, 'Logged out successfully');
    }

    /**
     * Get authenticated user
     * GET /auth/me
     * Public endpoint - returns user if authenticated, 401 if not
     */
    @Get('me')
    @Public()
    @UseGuards(GatewayAuthGuard)
    async getMe(@Request() req: ReqWithRequester) {
        try {
            // If no requester (not authenticated), return 401
            if (!req.requester || !req.requester.sub) {
                throw new UnauthorizedException('No token provided');
            }

            const user = await this.authService.getCurrentUser(req.requester.sub);
            return successResponse({ user });
        } catch (error: unknown) {
            if (error instanceof UnauthorizedException) {
                throw error; // Re-throw 401 to maintain expected behavior
            }
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to get user'
            );
        }
    }

    /**
     * Update authenticated user
     * PATCH /auth/me
     */
    @Patch('me')
    @VerifiedOnly()
    async updateMe(
        @Request() req: ReqWithRequester,
        @Body() dto: { displayName?: string },
    ) {
        try {
            const user = await this.authService.updateUser(req.requester.sub, dto);
            return successResponse({ user });
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to update user'
            );
        }
    }

    /**
     * Delete authenticated user
     * DELETE /auth/me
     */
    @Delete('me')
    @UseGuards(GatewayAuthGuard)
    async deleteMe(@Request() req: ReqWithRequester) {
        try {
            await this.authService.deleteUser(req.requester.sub);
            return successResponse(null, 'User deleted successfully');
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to delete user'
            );
        }
    }

    // ========================================
    // Invite Token Endpoints (Internal Users)
    // ========================================

    /**
     * Verify invite token for internal users
     * POST /auth/verify-invite-token
     */
    @Post('verify-invite-token')
    @HttpCode(HttpStatus.OK)
    async verifyInviteToken(@Body('token') token: string) {
        if (!token) {
            throw new BadRequestException('Token is required');
        }

        try {
            const result = await this.authService.verifyInviteToken(token);

            if (!result.success) {
                return errorResponse('Invalid or expired invite link');
            }

            return successResponse(
                {
                    email: result.email,
                    role: result.role
                },
                'Invite token is valid'
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Token verification failed'
            );
        }
    }

    /**
     * Set password for invited internal user
     * POST /auth/set-password
     */
    @Post('set-password')
    @HttpCode(HttpStatus.OK)
    async setPassword(
        @Body('token') token: string,
        @Body('password') password: string,
    ) {
        if (!token || !password) {
            throw new BadRequestException('Token and password are required');
        }

        // Validate password strength
        if (password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters long');
        }

        try {
            await this.authService.setPassword(token, password);
            return successResponse(
                null,
                'Password set successfully. You can now login with your credentials.'
            );
        } catch (error: unknown) {
            return errorResponse(
                error instanceof Error ? error.message : 'Failed to set password'
            );
        }
    }

    /**
     * Helper to set auth cookies
     */
    private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        const baseOptions = this.getCookieOptions();

        res.cookie('access_token', accessToken, {
            ...baseOptions,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', refreshToken, {
            ...baseOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }

    /**
     * Shared cookie options based on environment and config
     */
    private getCookieOptions() {
        const isProd = process.env.NODE_ENV === 'production';
        const secure = isProd
            ? process.env.COOKIE_SECURE !== 'false'
            : process.env.COOKIE_SECURE === 'true';
        const sameSite = (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') || 'lax';

        return {
            httpOnly: true,
            secure,
            sameSite,
        };
    }
}
