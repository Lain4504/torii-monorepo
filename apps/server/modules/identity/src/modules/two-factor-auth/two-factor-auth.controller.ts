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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorAuthService } from './two-factor-auth.service';
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
@ApiTags('Two-Factor Authentication')
@Controller('auth/2fa')
@UseGuards(GatewayAuthGuard)
@ApiBearerAuth()
export class TwoFactorAuthController {
    constructor(
        private readonly twoFactorAuthService: TwoFactorAuthService,
        private readonly prisma: PrismaService,
    ) { }

    // ========================================
    // TOTP Endpoints
    // ========================================

    @Post('totp/generate')
    @ApiOperation({ summary: 'Generate TOTP secret and QR code' })
    @ApiResponse({
        status: 200,
        description: 'TOTP secret and QR code generated successfully',
    })
    async generateTotpSecret(@Request() req: ReqWithRequester) {
        return this.twoFactorAuthService.generateTotpSecret(req.requester.sub);
    }

    @Post('totp/enable')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enable TOTP 2FA' })
    @ApiResponse({
        status: 200,
        description: 'TOTP 2FA enabled successfully. Returns backup codes.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid verification code',
    })
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
    @ApiOperation({ summary: 'Disable TOTP 2FA' })
    @ApiResponse({
        status: 200,
        description: '2FA disabled successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid password',
    })
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
    @ApiOperation({ summary: 'Regenerate backup codes' })
    @ApiResponse({
        status: 200,
        description: 'Backup codes regenerated successfully',
    })
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
    @ApiOperation({ summary: 'Get 2FA status' })
    @ApiResponse({
        status: 200,
        description: 'Returns 2FA configuration status',
    })
    async get2FAStatus(@Request() req: ReqWithRequester) {
        return this.twoFactorAuthService.get2FAStatus(req.requester.sub);
    }
}
