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
import { GatewayAuthGuard } from '@server/shared';
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
        return this.twoFactorAuthService.generateTotpSecret(req.requester.sub);
    }

    @Post('totp/enable')
    @HttpCode(HttpStatus.OK)
    async enableTotp(
        @Request() req: ReqWithRequester,
        @Body() dto: EnableTotpDTO,
    ) {
        return this.twoFactorAuthService.enableTotp(
            req.requester.sub,
            dto.secret,
            dto.code,
        );
    }

    @Post('totp/disable')
    @HttpCode(HttpStatus.OK)
    async disableTotp(
        @Request() req: ReqWithRequester,
        @Body() dto: Disable2FADTO,
    ) {
        // Verify password
        const user = await this.prisma.user.findUnique({
            where: { id: req.requester.sub },
            select: { password: true },
        });

        if (!user || !user.password) {
            throw new BadRequestException('Invalid password');
        }

        const isValid = await argon2.verify(user.password, dto.password);
        if (!isValid) {
            throw new BadRequestException('Invalid password');
        }

        // Disable 2FA
        await this.twoFactorAuthService.disable2FA(req.requester.sub);

        return {
            success: true,
            message: '2FA disabled successfully',
        };
    }

    // ========================================
    // Backup Codes Endpoints
    // ========================================

    @Post('backup-codes/regenerate')
    @HttpCode(HttpStatus.OK)
    async regenerateBackupCodes(@Request() req: ReqWithRequester) {
        const backupCodes = await this.twoFactorAuthService.regenerateBackupCodes(
            req.requester.sub,
        );

        return {
            success: true,
            backupCodes,
            message: 'Backup codes regenerated. Please save them in a safe place.',
        };
    }


    // ========================================
    // Status Endpoint
    // ========================================

    @Get('status')
    async get2FAStatus(@Request() req: ReqWithRequester) {
        return this.twoFactorAuthService.get2FAStatus(req.requester.sub);
    }
}
