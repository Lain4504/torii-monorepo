/**
 * 2FA Method Types
 * Currently only TOTP (Google Authenticator) is supported
 */
export type TwoFactorMethod = 'totp';

/**
 * 2FA Status Response
 */
export interface TwoFactorAuthStatus {
    isEnabled: boolean;
    method?: TwoFactorMethod;
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
