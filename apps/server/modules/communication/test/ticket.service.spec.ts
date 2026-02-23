// --- Local Alias Mocks (Test-only fix for missing mappings) ---
jest.mock('@server/communication/interfaces/repositories', () => {
    return require('../src/interfaces/repositories');
}, { virtual: true });

jest.mock('@server/communication/interfaces/services', () => {
    return require('../src/interfaces/services');
}, { virtual: true });

// We do NOT mock rxjs firstValueFrom globally to use actual behavior
// -------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { TicketService } from '../src/modules/ticket/ticket.service';
import { EmailService } from '../src/modules/email/email.service';
import {
    TicketType,
    TicketStatus,
    NotificationType,
    OrderStatus
} from '@workspace/schemas';
import { TICKET_REPOSITORY_TOKEN } from '../src/interfaces/repositories';
import { NOTIFICATION_SERVICE_TOKEN } from '../src/interfaces/services';

describe('TicketService (Exhaustive)', () => {
    let service: TicketService;
    let ticketRepository: any;
    let notificationService: any;
    let natsClient: any;
    let emailService: any;

    const USER_ID = 'user-001';
    const TICKET_ID = 'ticket-001';
    const COURSE_ID = 'course-001';
    const ORDER_ID = 'order-001';

    const mockTicket: any = {
        id: TICKET_ID,
        userId: USER_ID,
        type: TicketType.SUPPORT,
        status: TicketStatus.PENDING,
        title: 'Issue',
        description: 'Details',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketService,
                {
                    provide: TICKET_REPOSITORY_TOKEN,
                    useValue: {
                        create: jest.fn(),
                        findById: jest.fn(),
                        findAll: jest.fn(),
                        updateStatus: jest.fn(),
                        count: jest.fn(),
                    },
                },
                {
                    provide: NOTIFICATION_SERVICE_TOKEN,
                    useValue: {
                        create: jest.fn(),
                    },
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: {
                        emit: jest.fn(),
                        send: jest.fn(),
                    },
                },
                {
                    provide: EmailService,
                    useValue: {
                        sendEmail: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TicketService>(TicketService);
        ticketRepository = module.get(TICKET_REPOSITORY_TOKEN);
        notificationService = module.get(NOTIFICATION_SERVICE_TOKEN);
        natsClient = module.get('NATS_SERVICE');
        emailService = module.get(EmailService);

        // Suppress logger noise
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
    });

    afterEach(() => jest.clearAllMocks());

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createTicket', () => {
        it('should create a support ticket successfully', async () => {
            const dto = { type: TicketType.SUPPORT, title: 'T', description: 'D' };
            ticketRepository.create.mockResolvedValue({ ...mockTicket, ...dto });

            const result = await service.createTicket(USER_ID, dto as any);
            expect(result.type).toBe(TicketType.SUPPORT);
            expect(ticketRepository.create).toHaveBeenCalledWith({ ...dto, userId: USER_ID });
        });

        describe('Refund Validation', () => {
            const refundDto: any = { type: TicketType.REFUND, metadata: { courseId: COURSE_ID } };

            it('should throw if courseId is missing in metadata for refund', async () => {
                await expect(service.createTicket(USER_ID, { type: TicketType.REFUND } as any))
                    .rejects.toThrow(BadRequestException);
            });

            it('should throw if user is not enrolled', async () => {
                natsClient.send.mockReturnValue(of({ isEnrolled: false }));
                await expect(service.createTicket(USER_ID, refundDto))
                    .rejects.toThrow('You are not enrolled');
            });

            it('should throw if enrollment is older than 14 days (Exact 15th day)', async () => {
                const oldDate = new Date();
                oldDate.setDate(oldDate.getDate() - 15); // 15 days ago
                natsClient.send.mockReturnValue(of({
                    isEnrolled: true,
                    enrollment: { enrollmentDate: oldDate.toISOString() }
                }));

                await expect(service.createTicket(USER_ID, refundDto))
                    .rejects.toThrow('trong vòng 14 ngày');
            });

            it('should pass if enrollment is exactly 14 days old', async () => {
                const boundaryDate = new Date();
                boundaryDate.setDate(boundaryDate.getDate() - 14); // Exactly 14 days
                natsClient.send.mockReturnValue(of({
                    isEnrolled: true,
                    enrollment: { enrollmentDate: boundaryDate.toISOString() }
                }));
                ticketRepository.create.mockResolvedValue({ ...mockTicket, type: TicketType.REFUND });

                const result = await service.createTicket(USER_ID, refundDto);
                expect(result.type).toBe(TicketType.REFUND);
            });

            it('should handle NATS check error', async () => {
                natsClient.send.mockReturnValue(throwError(() => new Error('NATS Fail')));
                await expect(service.createTicket(USER_ID, refundDto))
                    .rejects.toThrow('Could not verify enrollment status');
            });
        });
    });

    describe('getTicketById', () => {
        it('should return ticket if exists', async () => {
            ticketRepository.findById.mockResolvedValue(mockTicket);
            const result = await service.getTicketById(TICKET_ID);
            expect(result.id).toBe(TICKET_ID);
        });

        it('should throw NotFoundException if missing', async () => {
            ticketRepository.findById.mockResolvedValue(null);
            await expect(service.getTicketById(TICKET_ID)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTickets', () => {
        it('should handle pagination defaults', async () => {
            ticketRepository.findAll.mockResolvedValue({ data: [mockTicket], total: 1 });
            const result = await service.getTickets({} as any);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(1);
        });
    });

    describe('updateTicketStatus', () => {
        it('should throw if ticket is already finalized', async () => {
            ticketRepository.findById.mockResolvedValue({ ...mockTicket, status: TicketStatus.APPROVED });
            await expect(service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.PROCESSING }))
                .rejects.toThrow('already finalized');
        });

        describe('Refund Processing (Edges & Complex Flow)', () => {
            const refundTicket = { ...mockTicket, type: TicketType.REFUND, metadata: { courseId: COURSE_ID } };

            beforeEach(() => {
                ticketRepository.findById.mockResolvedValue(refundTicket);
                // Standard success mocks for NATS
                natsClient.send.mockImplementation((pattern: any) => {
                    const cmd = pattern.cmd;
                    if (cmd === 'learning.enrollment.check') return of({
                        isEnrolled: true,
                        enrollment: { enrollmentDate: new Date().toISOString() }
                    });
                    if (cmd === 'billing.order.findAll') return of({ data: [{ id: ORDER_ID, metadata: { courseId: COURSE_ID } }] });
                    if (cmd === 'learning.enrollment.delete') return of({ id: 'en-1', finalPrice: 1000, senderId: USER_ID });
                    if (cmd === 'billing.user_balance.add') return of({ success: true });
                    if (cmd === 'identity.users.findOne') return of({ user: { email: 'test@user.com', displayName: 'User' } });
                    if (cmd === 'learning.course.findOne') return of({ title: 'Course Name' });
                    return of({});
                });
                ticketRepository.updateStatus.mockResolvedValue({ ...refundTicket, status: TicketStatus.APPROVED });
            });

            it('should process full flow with senderId', async () => {
                natsClient.send.mockImplementation((pattern: any) => {
                    if (pattern.cmd === 'learning.enrollment.delete') return of({ finalPrice: 500, senderId: 'sender-001' });
                    return of({ isEnrolled: true, enrollment: { enrollmentDate: new Date() }, user: { email: 'a@b.com' } });
                });
                await service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.APPROVED });
                expect(natsClient.send).toHaveBeenCalledWith({ cmd: 'billing.user_balance.add' }, expect.objectContaining({ userId: 'sender-001' }));
            });

            it('should handle missing matching order when falling back', async () => {
                const ticketNoOrder = { ...refundTicket, metadata: { courseId: COURSE_ID } };
                ticketRepository.findById.mockResolvedValue(ticketNoOrder);
                natsClient.send.mockImplementation((pattern: any) => {
                    if (pattern.cmd === 'billing.order.findAll') return of({ data: [] }); // No matching order
                    return of({ isEnrolled: true, enrollment: { enrollmentDate: new Date() }, finalPrice: 0 });
                });
                await service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.APPROVED });
                expect(natsClient.send).toHaveBeenCalledWith({ cmd: 'billing.order.findAll' }, expect.anything());
            });

            it('should skip email if user results verify email is missing', async () => {
                natsClient.send.mockImplementation((pattern: any) => {
                    if (pattern.cmd === 'identity.users.findOne') return of({ user: {} }); // No email
                    return of({ isEnrolled: true, enrollment: { enrollmentDate: new Date() }, finalPrice: 0 });
                });
                await service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.APPROVED });
                expect(emailService.sendEmail).not.toHaveBeenCalled();
                expect(Logger.prototype.warn).toHaveBeenCalledWith(expect.stringContaining('Could not send refund email'));
            });

            it('should handle "not found" enrollment exception gracefully', async () => {
                natsClient.send.mockImplementation((pattern: any) => {
                    if (pattern.cmd === 'learning.enrollment.check') return throwError(() => new Error('Enrollment not found'));
                    return of({});
                });
                await service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.APPROVED });
                expect(Logger.prototype.warn).toHaveBeenCalledWith(expect.stringContaining('Enrollment not found during refund'));
                expect(ticketRepository.updateStatus).toHaveBeenCalled();
            });

            it('should handle audit log emission failure', async () => {
                natsClient.emit.mockImplementation(() => { throw new Error('Emit Fail'); });
                await service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.APPROVED });
                expect(Logger.prototype.error).toHaveBeenCalledWith(expect.stringContaining('Failed to emit audit log'));
            });

            it('should handle notification creation failure', async () => {
                notificationService.create.mockRejectedValue(new Error('Notify Fail'));
                await service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.APPROVED });
                expect(Logger.prototype.error).toHaveBeenCalledWith(expect.stringContaining('Failed to send notification'));
            });

            it('should skip balance refund if finalPrice is zero', async () => {
                natsClient.send.mockImplementation((pattern: any) => {
                    if (pattern.cmd === 'learning.enrollment.delete') return of({ finalPrice: 0 });
                    return of({ isEnrolled: true, enrollment: { enrollmentDate: new Date() } });
                });
                await service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.APPROVED });
                expect(natsClient.send).not.toHaveBeenCalledWith({ cmd: 'billing.user_balance.add' }, expect.anything());
            });
        });

        describe('Status Notifications', () => {
            it('should notify REJECTED status with reason', async () => {
                ticketRepository.findById.mockResolvedValue(mockTicket);
                ticketRepository.updateStatus.mockResolvedValue({ ...mockTicket, status: TicketStatus.REJECTED });

                await service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.REJECTED, response: 'Invalid' });

                expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('Invalid')
                }));
            });

            it('should notify PROCESSING status', async () => {
                ticketRepository.findById.mockResolvedValue(mockTicket);
                ticketRepository.updateStatus.mockResolvedValue({ ...mockTicket, status: TicketStatus.PROCESSING });

                await service.updateTicketStatus(TICKET_ID, 'staff-1', { status: TicketStatus.PROCESSING });

                expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                    title: 'Yêu cầu đang được xử lý'
                }));
            });
        });
    });

    describe('getTicketStats', () => {
        it('should return aggregated stats', async () => {
            ticketRepository.count.mockImplementation((where: any) => {
                if (where.status === TicketStatus.PENDING && where.type === TicketType.REFUND) return Promise.resolve(2);
                if (where.status === TicketStatus.PENDING) return Promise.resolve(5);
                return Promise.resolve(10);
            });

            const result = await service.getTicketStats();
            expect(result.pendingCount).toBe(5);
            expect(result.refundCount).toBe(2);
            expect(result.totalCount).toBe(10);
        });
    });
});
