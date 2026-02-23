import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SharedEmailService } from '@server/shared';
import * as pug from 'pug';
import * as fs from 'fs';
import { EmailService } from '../src/modules/email/email.service';
import { SendEmailEvent } from '../../infrastructure/events/email.event';

// Mock pug and fs
jest.mock('pug');
jest.mock('fs');

describe('EmailService', () => {
    let service: EmailService;
    let sharedEmailService: jest.Mocked<SharedEmailService>;

    beforeEach(async () => {
        const mockSharedEmailService = {
            sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: SharedEmailService,
                    useValue: mockSharedEmailService,
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
        sharedEmailService = module.get(SharedEmailService);

        // Mock Logger to prevent spamming the console
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => { });

        // Reset mocks
        jest.clearAllMocks();
        
        // Default fs.existsSync behavior
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        // Default pug.renderFile behavior
        (pug.renderFile as jest.Mock).mockReturnValue('<html>Test Content</html>');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendEmail', () => {
        const to = 'test@example.com';

        it('should send order_success email', async () => {
            const event: SendEmailEvent = {
                type: 'order_success',
                to,
                data: { courseName: 'Test Course', amount: 100000, orderId: 'ORD-1' } as any,
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('order-success.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Thanh toán thành công'),
                html: '<html>Test Content</html>',
            });
        });

        it('should send verification email', async () => {
            const event: SendEmailEvent = {
                type: 'verification',
                to,
                data: { token: 'token123' },
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('verification.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Xác thực tài khoản'),
                html: '<html>Test Content</html>',
            });
        });

        it('should send password_reset email', async () => {
            const event: SendEmailEvent = {
                type: 'password_reset',
                to,
                data: { resetLink: 'http://test.com/reset' },
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('password-reset.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Đặt lại mật khẩu'),
                html: '<html>Test Content</html>',
            });
        });

        it('should send password_reset_confirmation email', async () => {
            const event: SendEmailEvent = {
                type: 'password_reset_confirmation',
                to,
                data: {},
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('password-reset-confirmation.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Mật khẩu đã được đặt lại thành công'),
                html: '<html>Test Content</html>',
            });
        });

        it('should send otp email', async () => {
            const event: SendEmailEvent = {
                type: 'otp',
                to,
                data: { code: '123456' },
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('otp.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Mã OTP'),
                html: '<html>Test Content</html>',
            });
        });

        it('should send 2fa_code email', async () => {
            const event: SendEmailEvent = {
                type: '2fa_code',
                to,
                data: { code: '123456' },
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('2fa-code.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Mã xác thực 2FA'),
                html: '<html>Test Content</html>',
            });
        });

        it('should send welcome email', async () => {
            const event: SendEmailEvent = {
                type: 'welcome',
                to,
                data: { name: 'Test User' },
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('welcome.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Chào mừng đến với Torii Nihongo'),
                html: '<html>Test Content</html>',
            });
        });

        it('should send course_enrollment email', async () => {
            const event: SendEmailEvent = {
                type: 'course_enrollment',
                to,
                data: { courseName: 'Free Course' } as any,
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('enrollment-success.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Tham gia khóa học thành công'),
                html: '<html>Test Content</html>',
            });
        });

        it('should send invite email', async () => {
            const event: SendEmailEvent = {
                type: 'invite',
                to,
                data: { inviteLink: 'http://test.com/invite' },
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('invite.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Lời mời tham gia'),
                html: '<html>Test Content</html>',
                from: '"Torii Identity" <identity@torii.app>'
            });
        });

        it('should send refund_status email (APPROVED)', async () => {
            const event: SendEmailEvent = {
                type: 'refund_status',
                to,
                data: { status: 'APPROVED', amount: 50000, courseName: 'Test Course' } as any,
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('refund-status.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Hoàn tiền thành công'),
                html: '<html>Test Content</html>',
            });
        });

        it('should send refund_status email (REJECTED)', async () => {
            const event: SendEmailEvent = {
                type: 'refund_status',
                to,
                data: { status: 'REJECTED', amount: 50000, courseName: 'Test Course' } as any,
            };

            await service.sendEmail(event);

            expect(pug.renderFile).toHaveBeenCalledWith(expect.stringContaining('refund-status.pug'), event.data);
            expect(sharedEmailService.sendMail).toHaveBeenCalledWith({
                to,
                subject: expect.stringContaining('Thông báo kết quả yêu cầu hoàn tiền'),
                html: '<html>Test Content</html>',
            });
        });

        it('should warn and do nothing for unknown email type', async () => {
            const event: any = {
                type: 'unknown_type',
                to,
                data: {},
            };

            await service.sendEmail(event);

            expect(pug.renderFile).not.toHaveBeenCalled();
            expect(sharedEmailService.sendMail).not.toHaveBeenCalled();
        });

        it('should log error and throw if rendering fails', async () => {
            const event: SendEmailEvent = {
                type: 'welcome',
                to,
                data: {},
            };
            (pug.renderFile as jest.Mock).mockImplementation(() => {
                throw new Error('Render Fail');
            });

            await expect(service.sendEmail(event)).rejects.toThrow('Render Fail');
        });

        it('should try fallback template locations if initial path does not exist', async () => {
            (fs.existsSync as jest.Mock)
                .mockReturnValueOnce(false) // First check: templates/pug
                .mockReturnValueOnce(false) // Second check: dist/modules/email/templates/pug
                .mockReturnValueOnce(true);  // Third check: cwd/...
            
            const event: SendEmailEvent = {
                type: 'welcome',
                to,
                data: {},
            };

            await service.sendEmail(event);

            expect(fs.existsSync).toHaveBeenCalledTimes(3);
            expect(pug.renderFile).toHaveBeenCalled();
        });
    });
});
