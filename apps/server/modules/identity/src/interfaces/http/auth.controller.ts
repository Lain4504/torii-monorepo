import { Body, Controller, Delete, Get, Patch, Post, Request, UseGuards, Res, HttpCode, HttpStatus, UnauthorizedException, Query, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { GatewayAuthGuard, VerifiedOnly } from '@server/shared';
import { AuthService } from '../../modules/auth/auth.service';
import { RefreshTokenService } from '../../modules/auth/refresh-token.service';
import type { ReqWithRequester, UserRegistrationDTO, UserLoginDTO } from '@workspace/schemas';

/**
 * Auth HTTP Controller
 * Handles authentication and user profile management with refresh token support
 */
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly refreshTokenService: RefreshTokenService,
    ) { }

    /**
     * Register a new user
     * POST /auth/register
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() dto: UserRegistrationDTO,
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            const user = await this.authService.register(dto);

            return {
                success: true,
                message: 'Registration successful. Please check your email to verify your account.',
                data: { user }
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Registration failed'
            };
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
            return {
                success: true,
                message: 'Verification email sent'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to resend verification email'
            };
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
            const result = await this.authService.verifyMagicToken(token);

            if (!result.success) {
                return {
                    success: false,
                    message: 'Invalid or expired verification link'
                };
            }

            return {
                success: true,
                message: 'Email verified successfully',
                data: { email: result.email }
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Verification failed'
            };
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
    async forgotPassword(@Body('email') email: string) {
        if (!email) {
            throw new BadRequestException('Email is required');
        }

        try {
            await this.authService.forgotPassword(email);
            return {
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to process password reset request'
            };
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
                return {
                    success: false,
                    message: 'Invalid or expired reset token'
                };
            }

            return {
                success: true,
                message: 'Reset token is valid',
                data: { email: result.email }
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Token verification failed'
            };
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
            return {
                success: true,
                message: 'Password has been reset successfully. You can now login with your new password.'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to reset password'
            };
        }
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
        try {
            const result = await this.authService.login(dto);

            // Check if 2FA is required
            if (result.requiresTwoFactor) {
                return {
                    success: true,
                    requiresTwoFactor: true,
                    twoFactorMethod: result.twoFactorMethod,
                    tempToken: result.tempToken,
                    message: result.twoFactorMethod === 'totp'
                        ? 'Enter code from your authenticator app'
                        : `Verification code sent to your ${result.twoFactorMethod}`,
                };
            }

            // No 2FA - proceed with normal login
            const { user, accessToken } = result;

            // Generate refresh token
            const refreshToken = await this.refreshTokenService.createRefreshToken(user!.id);

            // Check Platform
            const platform = req.headers['x-platform'];

            if (platform === 'mobile') {
                // Mobile: Return tokens in body
                return {
                    success: true,
                    data: {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        user: {
                            id: user!.id,
                            email: user!.email,
                            displayName: user!.displayName,
                            role: user!.role,
                            verifiedAt: user!.verifiedAt,
                        }
                    }
                };
            } else {
                // Web: Set httpOnly cookies
                this.setAuthCookies(res, accessToken!, refreshToken);

                return {
                    success: true,
                    data: {
                        user: {
                            id: user!.id,
                            email: user!.email,
                            displayName: user!.displayName,
                            role: user!.role,
                            verifiedAt: user!.verifiedAt,
                        }
                    }
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Login failed'
            };
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
            const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

            // Check Platform
            const platform = req.headers['x-platform'];

            if (platform === 'mobile') {
                // Mobile: Return tokens in body
                return {
                    success: true,
                    data: {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        user: {
                            id: user.id,
                            email: user.email,
                            displayName: user.displayName,
                            role: user.role,
                            verifiedAt: user.verifiedAt,
                        }
                    }
                };
            } else {
                // Web: Set httpOnly cookies
                this.setAuthCookies(res, accessToken, refreshToken);

                return {
                    success: true,
                    data: {
                        user: {
                            id: user.id,
                            email: user.email,
                            displayName: user.displayName,
                            role: user.role,
                            verifiedAt: user.verifiedAt,
                        }
                    }
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message || '2FA verification failed'
            };
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
            const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

            // Check Platform
            const platform = req.headers['x-platform'];

            if (platform === 'mobile') {
                return {
                    success: true,
                    data: {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        user: {
                            id: user.id,
                            email: user.email,
                            displayName: user.displayName,
                            role: user.role,
                            verifiedAt: user.verifiedAt,
                        }
                    }
                };
            } else {
                // Web: Set httpOnly cookies
                this.setAuthCookies(res, accessToken, refreshToken);

                return {
                    success: true,
                    data: {
                        user: {
                            id: user.id,
                            email: user.email,
                            displayName: user.displayName,
                            role: user.role,
                            verifiedAt: user.verifiedAt,
                        }
                    }
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Google authentication failed'
            };
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
            return {
                success: true,
                message: 'Google account linked successfully',
                provider: 'google'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to link Google account'
            };
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
            return {
                success: true,
                message: `${provider} account unlinked successfully`
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to unlink provider'
            };
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
            return {
                success: true,
                data: { providers }
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to get linked providers'
            };
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
        const payload = await this.refreshTokenService.verifyRefreshToken(oldRefreshToken);

        if (!payload) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Get user from database token
        const user = await this.authService.getProfile(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Revoke old refresh token (rotation)
        const tokenHash = this.refreshTokenService.hashTokenPublic(oldRefreshToken);
        await this.refreshTokenService.revokeRefreshToken(tokenHash);

        // Generate new tokens
        const newAccessToken = await this.authService['jwtTokenProvider'].generateToken({
            sub: user.id,
            role: user.role as any,
        });
        const newRefreshToken = await this.refreshTokenService.createRefreshToken(user.id);

        // Check Platform
        const platform = req.headers['x-platform'];

        if (platform === 'mobile') {
            // Mobile: Return tokens in body
            return {
                success: true,
                data: {
                    access_token: newAccessToken,
                    refresh_token: newRefreshToken,
                }
            };
        } else {
            // Web: Set httpOnly cookies
            this.setAuthCookies(res, newAccessToken, newRefreshToken);

            return {
                success: true,
                message: 'Token refreshed successfully'
            };
        }
    }

    /**
     * Logout user
     * POST /auth/logout
     * 
     * Revokes refresh token and clears cookies
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;

        if (refreshToken) {
            const tokenHash = this.refreshTokenService.hashTokenPublic(refreshToken);
            await this.refreshTokenService.revokeRefreshToken(tokenHash);
        }

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return {
            success: true,
            message: 'Logged out successfully'
        };
    }

    /**
     * Get authenticated user profile
     * GET /auth/profile
     */
    @Get('profile')
    @UseGuards(GatewayAuthGuard)
    async getProfile(@Request() req: ReqWithRequester) {
        try {
            const user = await this.authService.getProfile(req.requester.sub);
            return {
                success: true,
                data: { user }
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to get profile'
            };
        }
    }

    /**
     * Update authenticated user profile
     * PATCH /auth/profile
     */
    @Patch('profile')
    @VerifiedOnly()
    async updateProfile(
        @Request() req: ReqWithRequester,
        @Body() dto: { displayName?: string },
    ) {
        try {
            const user = await this.authService.updateProfile(req.requester.sub, dto);
            return {
                success: true,
                data: { user }
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to update profile'
            };
        }
    }

    /**
     * Delete authenticated user profile
     * DELETE /auth/profile
     */
    @Delete('profile')
    @UseGuards(GatewayAuthGuard)
    async deleteProfile(@Request() req: ReqWithRequester) {
        try {
            await this.authService.deleteProfile(req.requester.sub);
            return {
                success: true,
                message: 'Profile deleted successfully'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to delete profile'
            };
        }
    }
    /**
     * Helper to set auth cookies
     */
    private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}
