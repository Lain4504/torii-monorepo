import {
    Controller,
    Post,
    Get,
    Body,
    Request,
    UseGuards,
    HttpCode,
    HttpStatus,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import type { ITwoFactorAuthService } from '../interfaces/services';
import { TWO_FACTOR_AUTH_SERVICE_TOKEN } from '../interfaces/services';
import { GatewayAuthGuard, successResponse, errorResponse } from '@server/shared';
import type {
    ReqWithRequester,
    EnableTotpDTO,
    Disable2FADTO,
} from '@workspace/schemas';
import * as argon2 from 'argon2';
import { PrismaService } from '@server/shared';

/**
 * Two-Factor Authentication Controller
 * Handles 2FA setup and management endpoints
 */
@Controller('auth/2fa')
@UseGuards(GatewayAuthGuard)
export class TwoFactorAuthController {
    constructor(
        @Inject(TWO_FACTOR_AUTH_SERVICE_TOKEN) private readonly twoFactorAuthService: ITwoFactorAuthService,
        private readonly prisma: PrismaService,
    ) { }

    // ========================================
    // TOTP Endpoints
    // ========================================

    @Post('totp/generate')
    async generateTotpSecret(@Request() req: ReqWithRequester) {
        try {
            const result = await this.twoFactorAuthService.generateTotpSecret(req.requester.sub);
            return successResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to generate TOTP secret');
        }
    }

    @Post('totp/enable')
    @HttpCode(HttpStatus.OK)
    async enableTotp(
        @Request() req: ReqWithRequester,
        @Body() dto: EnableTotpDTO,
    ) {
        try {
            const result = await this.twoFactorAuthService.enableTotp(
                req.requester.sub,
                dto.secret,
                dto.code,
            );
            return successResponse(result, '2FA enabled successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to enable 2FA');
        }
    }

    @Post('totp/disable')
    @HttpCode(HttpStatus.OK)
    async disableTotp(
        @Request() req: ReqWithRequester,
        @Body() dto: Disable2FADTO,
    ) {
        try {
            // Verify password
            const user = await this.prisma.user.findUnique({
                where: { id: req.requester.sub },
                select: { password: true },
            });

            if (!user || !user.password) {
                return errorResponse('Invalid password');
            }

            const isValid = await argon2.verify(user.password, dto.password);
            if (!isValid) {
                return errorResponse('Invalid password');
            }

            // Disable 2FA
            await this.twoFactorAuthService.disable2FA(req.requester.sub);
            return successResponse(null, '2FA disabled successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to disable 2FA');
        }
    }

    // ========================================
    // Backup Codes Endpoints
    // ========================================

    @Post('backup-codes/regenerate')
    @HttpCode(HttpStatus.OK)
    async regenerateBackupCodes(@Request() req: ReqWithRequester) {
        try {
            const backupCodes = await this.twoFactorAuthService.regenerateBackupCodes(
                req.requester.sub,
            );
            return successResponse(
                { backupCodes },
                'Backup codes regenerated. Please save them in a safe place.'
            );
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to regenerate backup codes');
        }
    }

    // ========================================
    // Status Endpoint
    // ========================================

    @Get('status')
    async get2FAStatus(@Request() req: ReqWithRequester) {
        try {
            const status = await this.twoFactorAuthService.get2FAStatus(req.requester.sub);
            return successResponse(status);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch 2FA status');
        }
    }
}
