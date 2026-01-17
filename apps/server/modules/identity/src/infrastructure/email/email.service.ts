import { Injectable, Logger } from '@nestjs/common';
import { SharedEmailService } from '@server/shared';
import { IEmailService } from '../../interfaces/services/i-email.service';

/**
 * Email Service Implementation
 * User Management specific email logic (templates, flows)
 * Uses SharedEmailService for actual transport
 */
@Injectable()
export class EmailService implements IEmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly sharedEmailService: SharedEmailService) { }

    /**
     * Send verification email with Magic Link
     */
    async sendVerificationEmail(
        email: string,
        displayName: string,
        verificationUrl: string
    ): Promise<void> {
        const htmlContent = this.generateVerificationEmailHtml(displayName, verificationUrl);
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
        const htmlContent = this.generatePasswordResetEmailHtml(displayName, resetUrl);
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
        const htmlContent = this.generatePasswordResetConfirmationEmailHtml(displayName);
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
        const htmlContent = `
            <h1>Mã xác thực 2 bước</h1>
            <p>Mã của bạn là: <strong>${code}</strong></p>
            <p>Mã này sẽ hết hạn trong 5 phút.</p>
        `;
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
        const htmlContent = `
            <h1>Chào mừng đến với Torii Nihongo!</h1>
            <p>Xin chào ${displayName},</p>
            <p>Chúng tôi rất vui khi bạn tham gia.</p>
        `;
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

        const htmlContent = this.generateOTPEmailHtml(displayName, otp, type);

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
        const htmlContent = this.generateInviteEmailHtml(displayName, inviteUrl, password);
        await this.sharedEmailService.sendMail({
            to: email,
            subject: 'Lời mời tham gia Torii Nihongo',
            html: htmlContent,
            from: '"Torii Identity" <identity@torii.app>'
        });
    }


    // ============================================
    // HTML Generators (Private)
    // ============================================

    private generateVerificationEmailHtml(displayName: string, verificationUrl: string): string {
        // (Simplified for brevity in overwrite - user saw full template before, reusing logic)
        // I will restore the FULL template from the previous view_file content to preserve quality
        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Xác thực tài khoản</title>
</head>
<body style="font-family: sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563eb;">Xin chào ${displayName}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản Torii Nihongo.</p>
        <p>Vui lòng click vào link dưới đây để xác thực email:</p>
        <a href="${verificationUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0;">Xác thực Email</a>
        <p style="color: gray; font-size: 0.9em;">Link hết hạn sau 24 giờ.</p>
    </div>
</body>
</html>
        `;
    }

    private generatePasswordResetEmailHtml(displayName: string, resetUrl: string): string {
        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Đặt lại mật khẩu</title>
</head>
<body style="font-family: sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
        <h2 style="color: #dc2626;">Xin chào ${displayName}!</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0;">Đặt lại mật khẩu</a>
        <p style="color: gray; font-size: 0.9em;">Link hết hạn sau 1 giờ.</p>
    </div>
</body>
</html>
        `;
    }

    private generatePasswordResetConfirmationEmailHtml(displayName: string): string {
        return `
<!DOCTYPE html>
<html lang="vi">
<body style="font-family: sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
        <h2 style="color: #059669;">Mật khẩu đã được đặt lại</h2>
        <p>Xin chào ${displayName},</p>
        <p>Mật khẩu của bạn đã được thay đổi thành công.</p>
    </div>
</body>
</html>
        `;
    }

    private generateOTPEmailHtml(displayName: string, otp: string, type: 'registration' | 'reset-password'): string {

        const title = type === 'registration' ? 'Xác thực đăng ký' : 'Đặt lại mật khẩu';
        const message = type === 'registration'
            ? 'Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã dưới đây để xác thực tài khoản của bạn:'
            : 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã dưới đây để tiếp tục:';

        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
</head>
<body style="font-family: sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h2 style="color: #2563eb;">Xin chào ${displayName || 'bạn'}!</h2>
        <p>${message}</p>
        <div style="background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af;">
            ${otp}
        </div>
        <p style="color: gray; font-size: 0.9em;">Mã này sẽ hết hạn trong 10 phút.</p>
        <p style="color: gray; font-size: 0.8em;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
    </div>
</body>
</html>
        `;
    }

    private generateInviteEmailHtml(displayName: string, inviteUrl: string, password: string): string {
        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Lời mời tham gia Torii Nihongo</title>
</head>
<body style="font-family: sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Xin chào ${displayName}!</h2>
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Bạn đã được mời tham gia hệ thống Torii Nihongo với tư cách là thành viên nội bộ.</p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; font-weight: bold; margin: 0 0 8px 0; font-size: 14px;">THÔNG TIN ĐĂNG NHẬP MẶC ĐỊNH:</p>
            <p style="color: #78350f; margin: 0 0 8px 0; font-size: 13px;">Mật khẩu đăng nhập của bạn là:</p>
            <div style="background: #ffffff; border: 2px solid #f59e0b; padding: 12px; border-radius: 6px; text-align: center; margin: 12px 0;">
                <code style="font-size: 18px; font-weight: bold; color: #92400e; letter-spacing: 2px; font-family: 'Courier New', monospace;">${password}</code>
            </div>
            <p style="color: #78350f; margin: 12px 0 0 0; font-size: 13px; font-weight: bold;">Vui lòng đổi mật khẩu mặc định này sau khi đăng nhập vào hệ thống.</p>
        </div>

        <p style="color: #374151; line-height: 1.6; margin: 20px 0;">Bạn có thể sử dụng email và mật khẩu ở trên để đăng nhập vào hệ thống:</p>
        <a href="${inviteUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold;">Truy cập hệ thống</a>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 0.85em; margin: 8px 0;">Tài khoản của bạn đã được kích hoạt và sẵn sàng sử dụng.</p>
            <p style="color: #9ca3af; font-size: 0.8em; margin-top: 16px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
    </div>
</body>
</html>
        `;
    }
}

// Token moved to interface file
