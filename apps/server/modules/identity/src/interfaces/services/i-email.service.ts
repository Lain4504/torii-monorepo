/**
 * Email Service Interface
 * Abstraction for email sending to support multiple providers
 */
export interface IEmailService {
    /**
     * Send verification email
     */
    sendVerificationEmail(email: string, displayName: string, verificationUrl: string): Promise<void>;

    /**
     * Send password reset email
     */
    sendPasswordResetEmail(email: string, displayName: string, resetUrl: string): Promise<void>;

    /**
     * Send password reset confirmation email
     */
    sendPasswordResetConfirmationEmail(email: string, displayName: string): Promise<void>;

    /**
     * Send 2FA code via email
     */
    send2FACode(email: string, code: string): Promise<void>;

    /**
     * Send OTP for mobile verification or password reset
     */
    sendOTPEmail(email: string, displayName: string, otp: string, type: 'registration' | 'reset-password'): Promise<void>;


    /**
     * Send welcome email after registration
     */
    sendWelcomeEmail(email: string, displayName: string): Promise<void>;

    /**
     * Send invite email for internal users (LECTURE/STAFF)
     */
    sendInviteEmail(email: string, displayName: string, inviteUrl: string): Promise<void>;
}

/**
 * Email Service Injection Token
 */
export const EMAIL_SERVICE_TOKEN = Symbol('EMAIL_SERVICE');
