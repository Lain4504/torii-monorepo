import { Injectable, Logger } from '@nestjs/common';
import { SharedEmailService } from '@server/shared';
import type { SendEmailEvent, EmailType, OrderSuccessEmailData } from '../../infrastructure/events/email.event';
import { generateOrderSuccessEmailHtml } from './templates/order-success.template';
import { generateVerificationEmailHtml } from './templates/verification.template';
import { generatePasswordResetEmailHtml } from './templates/password-reset.template';
import { generateOtpEmailHtml } from './templates/otp.template';
import { generateWelcomeEmailHtml } from './templates/welcome.template';
import { generateEnrollmentSuccessEmailHtml } from './templates/enrollment-success.template';
import type { EnrollmentSuccessEmailData } from '../../infrastructure/events/email.event';


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

        this.logger.log(`[EmailService] Received request to send email. Type: ${type}, To: ${to}`);


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

                case 'course_enrollment':
                    await this.sendEnrollmentSuccessEmail(to, data as EnrollmentSuccessEmailData);
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
        const html = generateVerificationEmailHtml(data);

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
        const html = generatePasswordResetEmailHtml(data);

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
        const html = generateOtpEmailHtml(data);

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
        const html = generateWelcomeEmailHtml(data);

        await this.sharedEmailService.sendMail({
            to,
            subject: 'Chào mừng đến với Torii Nihongo',
            html,
        });

        this.logger.log(`Welcome email sent to: ${to}`);
    }

    /**
     * Send enrollment success email (for free courses)
     */
    private async sendEnrollmentSuccessEmail(to: string | string[], data: EnrollmentSuccessEmailData): Promise<void> {

        const html = generateEnrollmentSuccessEmailHtml(data);

        await this.sharedEmailService.sendMail({
            to,
            subject: '🎉 Tham gia khóa học thành công - Bắt đầu học ngay!',
            html,
        });

        this.logger.log(`Enrollment success email sent to: ${to}, course: ${data.courseName}`);
    }
}

