import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private transporter: Transporter | null = null;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        await this.initializeTransporter();
    }

    /**
     * Initialize SMTP transporter
     */
    private async initializeTransporter() {
        const smtpEnabled = this.configService.get<string>('SMTP_ENABLED') === 'true';

        if (!smtpEnabled) {
            this.logger.warn('📧 SMTP is DISABLED - Using mock email logging for development');
            return;
        }

        const smtpHost = this.configService.get<string>('SMTP_HOST');
        const smtpPort = this.configService.get<number>('SMTP_PORT');
        const smtpUser = this.configService.get<string>('SMTP_USER');
        const smtpPass = this.configService.get<string>('SMTP_PASS');
        const smtpFrom = this.configService.get<string>('SMTP_FROM');

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
            this.logger.warn('📧 SMTP credentials missing - Using mock email logging');
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465, // true for 465, false for other ports
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });

            // Verify connection
            await this.transporter.verify();
            this.logger.log(`✅ SMTP connection verified: ${smtpHost}:${smtpPort}`);
            this.logger.log(`📧 Email service ready to send from: ${smtpFrom}`);
        } catch (error) {
            this.logger.error(`❌ Failed to initialize SMTP: ${error.message}`);
            this.logger.warn('📧 Falling back to mock email logging');
            this.transporter = null;
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
        const htmlContent = this.generateVerificationEmailHtml(displayName, verificationUrl);
        const subject = 'Xác thực tài khoản Torii Nihongo';

        // If SMTP is configured, send real email
        if (this.transporter) {
            try {
                const smtpFrom = this.configService.get<string>('SMTP_FROM') || '"Torii Nihongo" <noreply@torii.app>';

                const info = await this.transporter.sendMail({
                    from: smtpFrom,
                    to: email,
                    subject: subject,
                    html: htmlContent,
                });

                this.logger.log(`✅ Email sent to ${email} - Message ID: ${info.messageId}`);
                return;
            } catch (error) {
                this.logger.error(`❌ Failed to send email to ${email}: ${error.message}`);
                this.logger.warn('Falling back to mock logging for this email');
                // Fall through to mock logging
            }
        }

        // Mock email for development (when SMTP is disabled or failed)
        this.logger.log(`=================================================`);
        this.logger.log(`📧 MOCK EMAIL TO: ${email}`);
        this.logger.log(`Subject: ${subject}`);
        this.logger.log(`\nHTML Content Preview:`);
        this.logger.log(`---`);
        this.logger.log(`Xin chào ${displayName},`);
        this.logger.log(`Cảm ơn bạn đã đăng ký tài khoản Torii Nihongo!`);
        this.logger.log(`\nLink xác thực:`);
        this.logger.log(verificationUrl);
        this.logger.log(`\nLink này sẽ hết hạn sau 24 giờ.`);
        this.logger.log(`---`);
        this.logger.log(`=================================================`);
    }

    /**
     * Generate HTML email template for verification
     */
    private generateVerificationEmailHtml(displayName: string, verificationUrl: string): string {
        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác thực tài khoản</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Torii Nihongo
            </h1>
            <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">
                Your Gateway to Japanese Language Mastery
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Xin chào ${displayName}!
            </h2>
            
            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Cảm ơn bạn đã đăng ký tài khoản Torii Nihongo! Chúng tôi rất vui khi được đồng hành cùng bạn trên hành trình chinh phục tiếng Nhật.
            </p>

            <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Vui lòng click vào nút bên dưới để xác thực địa chỉ email của bạn:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; 
                          background-color: #2563eb; 
                          color: #ffffff; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: 600; 
                          font-size: 16px;
                          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                    Xác thực Email
                </a>
            </div>

            <!-- Alternative link -->
            <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    Hoặc copy link sau vào trình duyệt:
                </p>
                <p style="margin: 0; word-break: break-all;">
                    <a href="${verificationUrl}" style="color: #2563eb; text-decoration: none; font-size: 13px;">
                        ${verificationUrl}
                    </a>
                </p>
            </div>

            <!-- Expiry notice -->
            <p style="margin: 30px 0 0; padding: 15px; background-color: #fef3c7; color: #92400e; font-size: 14px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                ⏰ <strong>Lưu ý:</strong> Link xác thực sẽ hết hạn sau <strong>24 giờ</strong>.
            </p>

            <!-- Security notice -->
            <p style="margin: 30px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này. Không cần thực hiện thêm bất kỳ hành động nào.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Trân trọng,<br>
                <strong>Đội ngũ Torii Nihongo</strong>
            </p>
            <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Torii Nihongo. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `.trim();
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
        const subject = 'Đặt lại mật khẩu - Torii Nihongo';

        // If SMTP is configured, send real email
        if (this.transporter) {
            try {
                const smtpFrom = this.configService.get<string>('SMTP_FROM') || '"Torii Nihongo" <noreply@torii.app>';

                const info = await this.transporter.sendMail({
                    from: smtpFrom,
                    to: email,
                    subject: subject,
                    html: htmlContent,
                });

                this.logger.log(`✅ Password reset email sent to ${email} - Message ID: ${info.messageId}`);
                return;
            } catch (error) {
                this.logger.error(`❌ Failed to send password reset email to ${email}: ${error.message}`);
                this.logger.warn('Falling back to mock logging for this email');
                // Fall through to mock logging
            }
        }

        // Mock email for development
        this.logger.log(`=================================================`);
        this.logger.log(`📧 MOCK PASSWORD RESET EMAIL TO: ${email}`);
        this.logger.log(`Subject: ${subject}`);
        this.logger.log(`\nHTML Content Preview:`);
        this.logger.log(`---`);
        this.logger.log(`Xin chào ${displayName},`);
        this.logger.log(`Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.`);
        this.logger.log(`\nLink đặt lại mật khẩu:`);
        this.logger.log(resetUrl);
        this.logger.log(`\nLink này sẽ hết hạn sau 1 giờ.`);
        this.logger.log(`---`);
        this.logger.log(`=================================================`);
    }

    /**
     * Send password reset confirmation email
     */
    async sendPasswordResetConfirmationEmail(
        email: string,
        displayName: string
    ): Promise<void> {
        const htmlContent = this.generatePasswordResetConfirmationEmailHtml(displayName);
        const subject = 'Mật khẩu đã được đặt lại - Torii Nihongo';

        // If SMTP is configured, send real email
        if (this.transporter) {
            try {
                const smtpFrom = this.configService.get<string>('SMTP_FROM') || '"Torii Nihongo" <noreply@torii.app>';

                const info = await this.transporter.sendMail({
                    from: smtpFrom,
                    to: email,
                    subject: subject,
                    html: htmlContent,
                });

                this.logger.log(`✅ Password reset confirmation email sent to ${email} - Message ID: ${info.messageId}`);
                return;
            } catch (error) {
                this.logger.error(`❌ Failed to send confirmation email to ${email}: ${error.message}`);
                this.logger.warn('Falling back to mock logging for this email');
                // Fall through to mock logging
            }
        }

        // Mock email for development
        this.logger.log(`=================================================`);
        this.logger.log(`📧 MOCK PASSWORD RESET CONFIRMATION EMAIL TO: ${email}`);
        this.logger.log(`Subject: ${subject}`);
        this.logger.log(`\nHTML Content Preview:`);
        this.logger.log(`---`);
        this.logger.log(`Xin chào ${displayName},`);
        this.logger.log(`Mật khẩu của bạn đã được đặt lại thành công!`);
        this.logger.log(`Bạn có thể đăng nhập ngay bây giờ với mật khẩu mới.`);
        this.logger.log(`---`);
        this.logger.log(`=================================================`);
    }

    /**
     * Generate HTML email template for password reset
     */
    private generatePasswordResetEmailHtml(displayName: string, resetUrl: string): string {
        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🔐 Đặt lại mật khẩu
            </h1>
            <p style="margin: 10px 0 0; color: #fecaca; font-size: 14px;">
                Torii Nihongo
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Xin chào ${displayName}!
            </h2>
            
            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Torii Nihongo của bạn.
            </p>

            <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Vui lòng click vào nút bên dưới để đặt lại mật khẩu:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; 
                          background-color: #dc2626; 
                          color: #ffffff; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: 600; 
                          font-size: 16px;
                          box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                    Đặt lại mật khẩu
                </a>
            </div>

            <!-- Alternative link -->
            <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #dc2626;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    Hoặc copy link sau vào trình duyệt:
                </p>
                <p style="margin: 0; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #dc2626; text-decoration: none; font-size: 13px;">
                        ${resetUrl}
                    </a>
                </p>
            </div>

            <!-- Expiry notice -->
            <p style="margin: 30px 0 0; padding: 15px; background-color: #fef3c7; color: #92400e; font-size: 14px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                ⏰ <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ hết hạn sau <strong>1 giờ</strong>.
            </p>

            <!-- Security notice -->
            <div style="margin: 30px 0 0; padding: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
                <p style="margin: 0 0 10px; color: #991b1b; font-size: 14px; font-weight: 600;">
                    🔒 Bảo mật tài khoản
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 13px; line-height: 1.6;">
                    Nếu bạn <strong>không yêu cầu</strong> đặt lại mật khẩu, vui lòng bỏ qua email này. 
                    Tài khoản của bạn vẫn an toàn và không có thay đổi nào được thực hiện.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Trân trọng,<br>
                <strong>Đội ngũ Torii Nihongo</strong>
            </p>
            <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Torii Nihongo. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    /**
     * Generate HTML email template for password reset confirmation
     */
    private generatePasswordResetConfirmationEmailHtml(displayName: string): string {
        return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mật khẩu đã được đặt lại</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ✅ Mật khẩu đã được đặt lại
            </h1>
            <p style="margin: 10px 0 0; color: #d1fae5; font-size: 14px;">
                Torii Nihongo
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Xin chào ${displayName}!
            </h2>
            
            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Mật khẩu cho tài khoản Torii Nihongo của bạn đã được <strong>đặt lại thành công</strong>! 🎉
            </p>

            <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bây giờ bạn có thể đăng nhập vào tài khoản của mình bằng mật khẩu mới.
            </p>

            <!-- Success Box -->
            <div style="margin: 30px 0; padding: 20px; background-color: #ecfdf5; border-radius: 6px; border-left: 4px solid #059669;">
                <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: 600;">
                    ✓ Thay đổi đã được áp dụng
                </p>
                <p style="margin: 0; color: #047857; font-size: 13px; line-height: 1.6;">
                    Mật khẩu mới của bạn đã được lưu an toàn. Vui lòng giữ mật khẩu này bí mật và không chia sẻ với bất kỳ ai.
                </p>
            </div>

            <!-- Security notice -->
            <div style="margin: 30px 0 0; padding: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
                <p style="margin: 0 0 10px; color: #991b1b; font-size: 14px; font-weight: 600;">
                    🔒 Bảo mật tài khoản
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 13px; line-height: 1.6;">
                    Nếu bạn <strong>không thực hiện</strong> thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức. 
                    Tài khoản của bạn có thể đã bị xâm nhập.
                </p>
            </div>

            <!-- Tips -->
            <div style="margin: 30px 0 0; padding: 20px; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #2563eb;">
                <p style="margin: 0 0 10px; color: #1e40af; font-size: 14px; font-weight: 600;">
                    💡 Mẹo bảo mật
                </p>
                <ul style="margin: 10px 0 0; padding-left: 20px; color: #1e3a8a; font-size: 13px; line-height: 1.8;">
                    <li>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
                    <li>Không sử dụng lại mật khẩu từ các trang web khác</li>
                    <li>Bật xác thực hai yếu tố (2FA) để bảo vệ tài khoản tốt hơn</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Trân trọng,<br>
                <strong>Đội ngũ Torii Nihongo</strong>
            </p>
            <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Torii Nihongo. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }
}
