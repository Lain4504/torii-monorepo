/**
 * Email Event Types
 */
export type EmailType =
    | 'verification'
    | 'password_reset'
    | 'password_reset_confirmation'
    | 'otp'
    | 'welcome'
    | 'invite'
    | '2fa_code'
    | 'order_success'
    | 'course_enrollment';

/**
 * Send Email Event
 * Emitted by services that need to send emails
 */
export interface SendEmailEvent {
    type: EmailType;
    to: string | string[];
    data: Record<string, any>;
}

/**
 * Order Success Email Data
 */
export interface OrderSuccessEmailData {
    displayName: string;
    courseName: string;
    courseUrl: string;
    amount: number;
    currency: string;
    orderId: string;
}
