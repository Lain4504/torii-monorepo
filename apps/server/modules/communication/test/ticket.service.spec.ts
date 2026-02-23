import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from '../src/modules/ticket/ticket.service';
import { TICKET_REPOSITORY_TOKEN } from '../src/interfaces/repositories';
import { NOTIFICATION_SERVICE_TOKEN } from '../src/interfaces/services';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { TicketStatus, TicketType, NotificationType, OrderStatus } from '@workspace/schemas';
import { EmailService } from '../src/modules/email/email.service';

describe('TicketService (Exhaustive)', () => {
    let service: TicketService;
    let ticketRepository: any;
    let notificationService: any;
    let natsClient: any;
    let emailService: any;

    const USER_ID = 'u-1';
    const TICKET_ID = 't-1';
    const COURSE_ID = 'c-1';
    const HANDLER_ID = 'h-1';

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
                    useValue: { create: jest.fn() },
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: { emit: jest.fn(), send: jest.fn() },
                },
                {
                    provide: EmailService,
                    useValue: { sendEmail: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<TicketService>(TicketService);
        ticketRepository = module.get(TICKET_REPOSITORY_TOKEN);
        notificationService = module.get(NOTIFICATION_SERVICE_TOKEN);
        natsClient = module.get('NATS_SERVICE');
        emailService = module.get(EmailService);

        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
    });

    afterEach(() => jest.clearAllMocks());

    describe('createTicket', () => {
        it('should create support ticket without NATS checks', async () => {
            const dto = { title: 'H', description: 'D', type: TicketType.SUPPORT };
            ticketRepository.create.mockResolvedValue({ id: TICKET_ID, ...dto, userId: USER_ID });

            const result = await service.createTicket(USER_ID, dto as any);

            expect(result.id).toBe(TICKET_ID);
            expect(natsClient.send).not.toHaveBeenCalled();
        });

        it('should validate refund ticket - 14 day rule FAIL', async () => {
            const dto = { type: TicketType.REFUND, metadata: { courseId: COURSE_ID } };
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 15);
            
            natsClient.send.mockReturnValue(of({ 
                isEnrolled: true, 
                enrollment: { enrollmentDate: oldDate.toISOString() } 
            }));

            await expect(service.createTicket(USER_ID, dto as any))
                .rejects.toThrow('Bạn chỉ có thể yêu cầu hoàn tiền trong vòng 14 ngày');
        });

        it('should validate refund ticket - 14 day rule SUCCESS', async () => {
            const dto = { type: TicketType.REFUND, metadata: { courseId: COURSE_ID } };
            const recentDate = new Date();
            recentDate.setDate(recentDate.getDate() - 5);
            
            natsClient.send.mockReturnValue(of({ 
                isEnrolled: true, 
                enrollment: { enrollmentDate: recentDate.toISOString() } 
            }));
            ticketRepository.create.mockResolvedValue({ id: TICKET_ID });

            const result = await service.createTicket(USER_ID, dto as any);
            expect(result.id).toBe(TICKET_ID);
        });

        it('should throw if enrollment check returns false', async () => {
            const dto = { type: TicketType.REFUND, metadata: { courseId: COURSE_ID } };
            natsClient.send.mockReturnValue(of({ isEnrolled: false }));

            await expect(service.createTicket(USER_ID, dto as any))
                .rejects.toThrow('You are not enrolled in this course');
        });
    });

    describe('updateTicketStatus', () => {
        const approveDto = { status: TicketStatus.APPROVED, response: 'Approved' };

        it('should throw if ticket already finalized', async () => {
            ticketRepository.findById.mockResolvedValue({ status: TicketStatus.REJECTED });
            await expect(service.updateTicketStatus(TICKET_ID, HANDLER_ID, approveDto))
                .rejects.toThrow(BadRequestException);
        });

        describe('Refund Approval Flow', () => {
            const ticket = { 
                id: TICKET_ID, userId: USER_ID, type: TicketType.REFUND, 
                status: TicketStatus.PENDING, metadata: { courseId: COURSE_ID } 
            };

            it('should process full refund flow (Enrollment -> Order -> Balance -> Email)', async () => {
                ticketRepository.findById.mockResolvedValue(ticket);
                // 1. Enrollment check (re-verify)
                natsClient.send.mockReturnValueOnce(of({ 
                    isEnrolled: true, 
                    enrollment: { enrollmentDate: new Date().toISOString() } 
                }));
                // 2. Order find (metadata fallback)
                natsClient.send.mockReturnValueOnce(of({ 
                    data: [{ id: 'ord-123', metadata: { courseId: COURSE_ID } }] 
                }));
                // 3. Enrollment delete
                natsClient.send.mockReturnValueOnce(of({ 
                    id: 'enr-1', finalPrice: 1000.5, senderId: 'buyer-1' 
                }));
                // 4. Balance add
                natsClient.send.mockReturnValueOnce(of({ success: true }));
                // 5. User & Course find (for email)
                natsClient.send.mockReturnValueOnce(of({ user: { email: 'u@test.com', displayName: 'User' } }));
                natsClient.send.mockReturnValueOnce(of({ title: 'Course 101' }));

                ticketRepository.updateStatus.mockResolvedValue({ ...ticket, status: TicketStatus.APPROVED });

                await service.updateTicketStatus(TICKET_ID, HANDLER_ID, approveDto as any);

                // Verify Audit Log
                expect(natsClient.emit).toHaveBeenCalledWith(
                    { cmd: 'identity.audit.log' },
                    expect.objectContaining({ action: 'ticket.update_status', userId: HANDLER_ID })
                );

                // Verify Coin Rounding
                expect(natsClient.send).toHaveBeenCalledWith(
                    { cmd: 'billing.user_balance.add' },
                    expect.objectContaining({ amount: 1001, userId: 'buyer-1' }) 
                );

                // Verify Email
                expect(emailService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
                    to: 'u@test.com',
                    data: expect.objectContaining({ amount: 1001, courseName: 'Course 101' })
                }));
            });

            it('should continue if balance refund fail (logged error)', async () => {
                ticketRepository.findById.mockResolvedValue(ticket);
                natsClient.send.mockReturnValueOnce(of({ isEnrolled: true, enrollment: { enrollmentDate: new Date() } }));
                natsClient.send.mockReturnValueOnce(of({ data: [] })); // no orders
                natsClient.send.mockReturnValueOnce(of({ finalPrice: 500 }));
                natsClient.send.mockReturnValueOnce(throwError(() => new Error('Bank error')));
                
                // Email lookups
                natsClient.send.mockReturnValueOnce(of({ user: { email: 'u@test.com' } }));
                natsClient.send.mockReturnValueOnce(of({ title: 'C' }));

                ticketRepository.updateStatus.mockResolvedValue({ ...ticket, status: TicketStatus.APPROVED });

                await service.updateTicketStatus(TICKET_ID, HANDLER_ID, approveDto as any);
                
                expect(ticketRepository.updateStatus).toHaveBeenCalled();
            });

            it('should fallback to userId if senderId is missing in deletedEnrollment', async () => {
                ticketRepository.findById.mockResolvedValue(ticket);
                natsClient.send.mockReturnValueOnce(of({ isEnrolled: true, enrollment: { enrollmentDate: new Date() } }));
                natsClient.send.mockReturnValueOnce(of({ data: [] }));
                natsClient.send.mockReturnValueOnce(of({ finalPrice: 100 })); // NO senderId
                ticketRepository.updateStatus.mockResolvedValue({ ...ticket, status: TicketStatus.APPROVED });

                await service.updateTicketStatus(TICKET_ID, HANDLER_ID, approveDto as any);

                expect(natsClient.send).toHaveBeenCalledWith(
                    { cmd: 'billing.user_balance.add' },
                    expect.objectContaining({ userId: USER_ID }) 
                );
            });

            it('should throw if enrollment re-verification fails', async () => {
                ticketRepository.findById.mockResolvedValue(ticket);
                natsClient.send.mockReturnValue(of({ isEnrolled: false }));

                await expect(service.updateTicketStatus(TICKET_ID, HANDLER_ID, approveDto as any))
                    .rejects.toThrow('Enrollment not found or already processed.');
            });

            it('should continue if order search fails to find matching course', async () => {
                ticketRepository.findById.mockResolvedValue(ticket);
                natsClient.send.mockReturnValueOnce(of({ isEnrolled: true, enrollment: { enrollmentDate: new Date() } }));
                natsClient.send.mockReturnValueOnce(of({ data: [{ id: 'other', metadata: { courseId: 'wrong' } }] }));
                natsClient.send.mockReturnValueOnce(of({ finalPrice: 100 }));
                
                ticketRepository.updateStatus.mockResolvedValue({ ...ticket, status: TicketStatus.APPROVED });

                await service.updateTicketStatus(TICKET_ID, HANDLER_ID, approveDto as any);

                expect(ticketRepository.updateStatus).toHaveBeenCalled();
            });

            it('should proceed with warning if enrollment not found during refund (NATS error)', async () => {
                ticketRepository.findById.mockResolvedValue(ticket);
                natsClient.send.mockReturnValueOnce(of({ isEnrolled: true, enrollment: { enrollmentDate: new Date() } }));
                natsClient.send.mockReturnValueOnce(of({ data: [] }));
                natsClient.send.mockReturnValueOnce(throwError(() => new Error('enrollment not found'))); 

                ticketRepository.updateStatus.mockResolvedValue({ ...ticket, status: TicketStatus.APPROVED });

                await service.updateTicketStatus(TICKET_ID, HANDLER_ID, approveDto as any);

                expect(ticketRepository.updateStatus).toHaveBeenCalled();
            });

            it('should throw BadRequest if generic error occurs in NATS workflow', async () => {
                ticketRepository.findById.mockResolvedValue(ticket);
                natsClient.send.mockReturnValueOnce(of({ isEnrolled: true, enrollment: { enrollmentDate: new Date() } }));
                natsClient.send.mockReturnValueOnce(of({ data: [] }));
                natsClient.send.mockReturnValueOnce(throwError(() => new Error('CRITICAL DB FAILURE')));

                await expect(service.updateTicketStatus(TICKET_ID, HANDLER_ID, approveDto as any))
                    .rejects.toThrow('Failed to process enrollment cancellation');
            });
        });

        it('should handle REJECTED status and notify user (with fallback message)', async () => {
            const ticket = { id: TICKET_ID, userId: USER_ID, status: TicketStatus.PENDING, type: TicketType.SUPPORT };
            ticketRepository.findById.mockResolvedValue(ticket);
            ticketRepository.updateStatus.mockResolvedValue({ ...ticket, status: TicketStatus.REJECTED });

            await service.updateTicketStatus(TICKET_ID, HANDLER_ID, { status: TicketStatus.REJECTED, response: '' });

            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Yêu cầu hỗ trợ bị từ chối',
                message: expect.stringContaining('Không có lý do cụ thể.')
            }));
        });

        it('should handle audit log emission failure gracefully', async () => {
            const ticket = { id: TICKET_ID, userId: USER_ID, status: TicketStatus.PENDING, type: TicketType.SUPPORT };
            ticketRepository.findById.mockResolvedValue(ticket);
            ticketRepository.updateStatus.mockResolvedValue(ticket);
            natsClient.emit.mockImplementation(() => { throw new Error('Emit fail'); });

            await service.updateTicketStatus(TICKET_ID, HANDLER_ID, { status: TicketStatus.PROCESSING, response: '' });

            expect(ticketRepository.updateStatus).toHaveBeenCalled();
            // Should not throw, just log error internally
        });

        it('should handle PROCESSING status and notify user', async () => {
            const ticket = { id: TICKET_ID, userId: USER_ID, status: TicketStatus.PENDING, type: TicketType.SUPPORT };
            ticketRepository.findById.mockResolvedValue(ticket);
            ticketRepository.updateStatus.mockResolvedValue({ ...ticket, status: TicketStatus.PROCESSING });

            await service.updateTicketStatus(TICKET_ID, HANDLER_ID, { status: TicketStatus.PROCESSING, response: '' });

            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Yêu cầu đang được xử lý'
            }));
        });
    });

    describe('getTickets', () => {
        it('should return paginated tickets', async () => {
            ticketRepository.findAll.mockResolvedValue({ data: [], total: 100 });
            const result = await service.getTickets({ page: 2, limit: 20 });
            expect(result.totalPages).toBe(5);
            expect(result.page).toBe(2);
        });
    });

    describe('getTicketById', () => {
        it('should return ticket if exists', async () => {
            ticketRepository.findById.mockResolvedValue({ id: TICKET_ID });
            const result = await service.getTicketById(TICKET_ID);
            expect(result.id).toBe(TICKET_ID);
        });

        it('should throw NotFound if missing', async () => {
            ticketRepository.findById.mockResolvedValue(null);
            await expect(service.getTicketById(TICKET_ID)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTicketStats', () => {
        it('should return correct counts', async () => {
            ticketRepository.count.mockResolvedValueOnce(10); // pending
            ticketRepository.count.mockResolvedValueOnce(3);  // refund
            ticketRepository.count.mockResolvedValueOnce(50); // total

            const res = await service.getTicketStats();

            expect(res).toEqual({ pendingCount: 10, refundCount: 3, totalCount: 50 });
        });
    });
});
