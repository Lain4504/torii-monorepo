import { Injectable, Logger } from '@nestjs/common';
import { SharedEmailService } from '@server/shared';
import type { SendEmailEvent, EmailType, OrderSuccessEmailData } from '../../infrastructure/events/email.event';
import { generateOrderSuccessEmailHtml } from './templates/order-success.template';

/**
 * Email Service
 * Handles email sending operations for Communication module
 */
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly sharedEmailService: SharedEmailService) { }

    /**
     * Send email based on event type
     */
    async sendEmail(event: SendEmailEvent): Promise<void> {
        const { type, to, data } = event;

        this.logger.log(`Sending email type: ${type} to: ${to}`);

        try {
            switch (type) {
                case 'order_success':
                    await this.sendOrderSuccessEmail(to, data as OrderSuccessEmailData);
                    break;

                case 'verification':
                    await this.sendVerificationEmail(to, data);
                    break;

                case 'password_reset':
                    await this.sendPasswordResetEmail(to, data);
                    break;

                case 'otp':
                    await this.sendOtpEmail(to, data);
                    break;

                case 'welcome':
                    await this.sendWelcomeEmail(to, data);
                    break;

                default:
                    this.logger.warn(`Unknown email type: ${type}`);
            }
        } catch (error: any) {
            this.logger.error(`Failed to send email type ${type}: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Send order success email with course link
     */
    private async sendOrderSuccessEmail(to: string | string[], data: OrderSuccessEmailData): Promise<void> {
        const html = generateOrderSuccessEmailHtml(data);

        await this.sharedEmailService.sendMail({
            to,
            subject: '🎉 Thanh toán thành công - Bắt đầu học ngay!',
            html,
        });

        this.logger.log(`Order success email sent to: ${to}, course: ${data.courseName}`);
    }

    /**
     * Send verification email
     */
    private async sendVerificationEmail(to: string | string[], data: any): Promise<void> {
        const { verificationUrl, displayName } = data;

        const html = `
      <h2>Xác thực tài khoản</h2>
      <p>Xin chào ${displayName || 'bạn'},</p>
      <p>Vui lòng click vào link dưới đây để xác thực tài khoản:</p>
      <a href="${verificationUrl}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
        Xác thực tài khoản
      </a>
    `;

        await this.sharedEmailService.sendMail({
            to,
            subject: 'Xác thực tài khoản Torii Nihongo',
            html,
        });

        this.logger.log(`Verification email sent to: ${to}`);
    }

    /**
     * Send password reset email
     */
    private async sendPasswordResetEmail(to: string | string[], data: any): Promise<void> {
        const { resetUrl, displayName } = data;

        const html = `
      <h2>Đặt lại mật khẩu</h2>
      <p>Xin chào ${displayName || 'bạn'},</p>
      <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào link dưới đây:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
        Đặt lại mật khẩu
      </a>
    `;

        await this.sharedEmailService.sendMail({
            to,
            subject: 'Đặt lại mật khẩu Torii Nihongo',
            html,
        });

        this.logger.log(`Password reset email sent to: ${to}`);
    }

    /**
     * Send OTP email
     */
    private async sendOtpEmail(to: string | string[], data: any): Promise<void> {
        const { otp, displayName } = data;

        const html = `
      <h2>Mã OTP của bạn</h2>
      <p>Xin chào ${displayName || 'bạn'},</p>
      <p>Mã OTP của bạn là:</p>
      <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>Mã này có hiệu lực trong 5 phút.</p>
    `;

        await this.sharedEmailService.sendMail({
            to,
            subject: 'Mã OTP Torii Nihongo',
            html,
        });

        this.logger.log(`OTP email sent to: ${to}`);
    }

    /**
     * Send welcome email
     */
    private async sendWelcomeEmail(to: string | string[], data: any): Promise<void> {
        const { displayName } = data;

        const html = `
      <h2>Chào mừng đến với Torii Nihongo!</h2>
      <p>Xin chào ${displayName || 'bạn'},</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Chúc bạn học tập hiệu quả!</p>
    `;

        await this.sharedEmailService.sendMail({
            to,
            subject: 'Chào mừng đến với Torii Nihongo',
            html,
        });

        this.logger.log(`Welcome email sent to: ${to}`);
    }
}
