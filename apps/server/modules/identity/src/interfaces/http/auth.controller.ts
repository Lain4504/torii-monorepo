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

            // AUTO-LOGIN: Generate tokens after registration
            const accessToken = await this.authService['jwtTokenProvider'].generateToken({
                sub: user.id,
                role: user.role as any,
            });
            const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

            // Check Platform
            const platform = req.headers['x-platform'];

            if (platform === 'mobile') {
                return {
                    success: true,
                    data: {
                        user,
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    }
                };
            } else {
                // Web: Set httpOnly cookies
                res.cookie('access_token', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 15 * 60 * 1000 // 15 minutes
                });

                res.cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });

                return {
                    success: true,
                    data: { user }
                };
            }
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
     * Verify email via OTP (Legacy - kept for backward compatibility)
     * POST /auth/verify-email
     */
    @Post('verify-email')
    async verifyEmail(
        @Body('email') email: string,
        @Body('otp') otp: string,
    ) {
        if (!email || !otp) {
            throw new BadRequestException('Email and OTP are required');
        }

        try {
            const isValid = await this.authService.verifyEmail(email, otp);

            if (!isValid) {
                return {
                    success: false,
                    message: 'Invalid or expired OTP'
                };
            }

            return {
                success: true,
                message: 'Email verified successfully'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Verification failed'
            };
        }
    }

    /**
     * Verify email via Magic Link token
     * POST /auth/verify-magic-link
     */
    @Post('verify-magic-link')
    @HttpCode(HttpStatus.OK)
    async verifyMagicLink(@Body('token') token: string) {
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


    /**
     * Login user
     * POST /auth/login
     * 
     * Sets both access_token (15m) and refresh_token (7d) cookies
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: UserLoginDTO,
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            const { user, accessToken } = await this.authService.login(dto);

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
                            status: user.status,
                        }
                    }
                };
            } else {
                // Web: Set httpOnly cookies
                res.cookie('access_token', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 15 * 60 * 1000 // 15 minutes
                });

                res.cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });

                return {
                    success: true,
                    data: {
                        user: {
                            id: user.id,
                            email: user.email,
                            displayName: user.displayName,
                            role: user.role,
                            status: user.status,
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
            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

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
}
