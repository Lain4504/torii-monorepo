import { Injectable, Logger } from '@nestjs/common';
import { SharedEmailService } from '@server/shared';
import { IEmailService } from '@server/identity/interfaces/services/i-email.service';
import * as pug from 'pug';
import * as path from 'path';

/**
 * Email Service Implementation
 * User Management specific email logic (templates, flows)
 * Uses SharedEmailService for actual transport
 */
@Injectable()
export class EmailService implements IEmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly templateDir = path.join(__dirname, 'templates', 'pug');

    constructor(private readonly sharedEmailService: SharedEmailService) { }

    private render(templateName: string, data: any): string {
        try {
            const templatePath = path.join(this.templateDir, `${templateName}.pug`);
            return pug.renderFile(templatePath, data);
        } catch (error) {
            this.logger.error(`Failed to render template ${templateName}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Send verification email with Magic Link
     */
    async sendVerificationEmail(
        email: string,
        displayName: string,
        verificationUrl: string
    ): Promise<void> {
        const htmlContent = this.render('verification', { displayName, verificationUrl });
        await this.sharedEmailService.sendMail({
            to: email,
            subject: 'Xác thực tài khoản Torii Nihongo',
            html: htmlContent,
            from: '"Torii Identity" <identity@torii.app>'
        });
    }

    /**
     * Send password reset email with reset link
     */
    async sendPasswordResetEmail(
        email: string,
        displayName: string,
        resetUrl: string
    ): Promise<void> {
        const htmlContent = this.render('password-reset', { displayName, resetUrl });
        await this.sharedEmailService.sendMail({
            to: email,
            subject: 'Đặt lại mật khẩu - Torii Nihongo',
            html: htmlContent,
        });
    }

    /**
     * Send password reset confirmation email
     */
    async sendPasswordResetConfirmationEmail(
        email: string,
        displayName: string
    ): Promise<void> {
        const htmlContent = this.render('password-reset-confirmation', { displayName });
        await this.sharedEmailService.sendMail({
            to: email,
            subject: 'Mật khẩu đã được đặt lại - Torii Nihongo',
            html: htmlContent,
        });
    }

    /**
     * Send 2FA code via email
     */
    async send2FACode(email: string, code: string): Promise<void> {
        const htmlContent = this.render('2fa', { code });
        await this.sharedEmailService.sendMail({
            to: email,
            subject: 'Mã xác thực 2 bước - Torii Nihongo',
            html: htmlContent,
        });
    }

    /**
     * Send welcome email after registration
     */
    async sendWelcomeEmail(email: string, displayName: string): Promise<void> {
        const htmlContent = this.render('welcome', { displayName });
        await this.sharedEmailService.sendMail({
            to: email,
            subject: 'Chào mừng đến với Torii Nihongo',
            html: htmlContent,
        });
    }

    /**
     * Send OTP for mobile verification or password reset
     */
    async sendOTPEmail(
        email: string,
        displayName: string,
        otp: string,
        type: 'registration' | 'reset-password'
    ): Promise<void> {
        const subject = type === 'registration'
            ? 'Mã xác thực đăng ký - Torii Nihongo'
            : 'Mã xác thực đặt lại mật khẩu - Torii Nihongo';

        const title = type === 'registration' ? 'Xác thực đăng ký' : 'Đặt lại mật khẩu';
        const message = type === 'registration'
            ? 'Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã dưới đây để xác thực tài khoản của bạn:'
            : 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã dưới đây để tiếp tục:';

        const htmlContent = this.render('otp', { displayName, otp, title, message });

        await this.sharedEmailService.sendMail({
            to: email,
            subject,
            html: htmlContent,
        });
    }

    /**
     * Send invite email for internal users (LECTURE/STAFF)
     * Includes auto-generated password that user should change after first login
     */
    async sendInviteEmail(email: string, displayName: string, inviteUrl: string, password: string): Promise<void> {
        const htmlContent = this.render('invite', { displayName, inviteUrl, password });
        await this.sharedEmailService.sendMail({
            to: email,
            subject: 'Lời mời tham gia Torii Nihongo',
            html: htmlContent,
            from: '"Torii Identity" <identity@torii.app>'
        });
    }
}

// Token moved to interface file

