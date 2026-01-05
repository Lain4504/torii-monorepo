import { IsString, IsNotEmpty, Length, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for enabling TOTP 2FA
 */
export class EnableTotpDto {
    @ApiProperty({
        description: 'TOTP secret generated from /totp/generate endpoint',
        example: 'JBSWY3DPEHPK3PXP',
    })
    @IsString()
    @IsNotEmpty()
    secret: string;

    @ApiProperty({
        description: '6-digit code from authenticator app',
        example: '123456',
    })
    @IsString()
    @Length(6, 6)
    code: string;
}

/**
 * DTO for verifying 2FA code during login
 */
export class Verify2FADto {
    @ApiProperty({
        description: 'Temporary token received from login endpoint',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    @IsNotEmpty()
    tempToken: string;

    @ApiProperty({
        description: '6-digit 2FA code',
        example: '123456',
    })
    @IsString()
    @Length(6, 6)
    code: string;

    @ApiProperty({
        description: 'Set to true if using a backup code instead of TOTP',
        example: false,
        required: false,
    })
    @IsOptional()
    backupCode?: boolean;
}

/**
 * DTO for disabling 2FA
 */
export class Disable2FADto {
    @ApiProperty({
        description: 'User password for verification',
        example: 'MySecurePassword123!',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}

/**
 * DTO for enabling SMS 2FA
 */
export class EnableSmsDto {
    @ApiProperty({
        description: 'Phone number in E.164 format',
        example: '+84901234567',
    })
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;
}

/**
 * DTO for verifying phone number
 */
export class VerifyPhoneDto {
    @ApiProperty({
        description: '6-digit verification code sent via SMS',
        example: '123456',
    })
    @IsString()
    @Length(6, 6)
    code: string;
}
