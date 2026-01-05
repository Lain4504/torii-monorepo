import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for Google OAuth authentication
 */
export class GoogleAuthDto {
    @ApiProperty({
        description: 'Google ID token from OAuth flow',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...',
    })
    @IsString()
    @IsNotEmpty()
    idToken: string;
}

/**
 * DTO for linking OAuth provider to existing account
 */
export class LinkProviderDto {
    @ApiProperty({
        description: 'OAuth provider name',
        enum: ['google'],
        example: 'google',
    })
    @IsString()
    @IsNotEmpty()
    provider: 'google';

    @ApiProperty({
        description: 'OAuth provider token (ID token)',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...',
    })
    @IsString()
    @IsNotEmpty()
    token: string;
}

/**
 * DTO for unlinking OAuth provider
 */
export class UnlinkProviderDto {
    @ApiProperty({
        description: 'OAuth provider to unlink',
        enum: ['google', 'email'],
        example: 'google',
    })
    @IsString()
    @IsNotEmpty()
    provider: 'google' | 'email';
}
