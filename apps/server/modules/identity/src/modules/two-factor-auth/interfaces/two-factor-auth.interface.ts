/**
 * 2FA Method Types
 */
export type TwoFactorMethod = 'totp' | 'email' | 'sms';

/**
 * 2FA Status Response
 */
export interface TwoFactorAuthStatus {
    isEnabled: boolean;
    method?: TwoFactorMethod;
    phoneNumber?: string; // Masked: +84***1234
    backupCodesRemaining?: number;
    enabledAt?: Date;
    lastUsedAt?: Date;
}

/**
 * TOTP Setup Response
 */
export interface TotpSetupResponse {
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
}

/**
 * Enable TOTP Response
 */
export interface EnableTotpResponse {
    success: boolean;
    backupCodes: string[];
    message: string;
}

/**
 * Temporary 2FA Token Payload
 */
export interface TwoFactorTempTokenPayload {
    userId: string;
    email: string;
    method: TwoFactorMethod;
    iat: number;
    exp: number;
}
