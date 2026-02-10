import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from '../src/modules/ticket/ticket.service';
import { TICKET_REPOSITORY_TOKEN } from '../src/interfaces/repositories';
import { NOTIFICATION_SERVICE_TOKEN } from '../src/interfaces/services';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { TicketStatus, TicketType, NotificationType } from '@workspace/schemas';

describe('TicketService', () => {
    let service: TicketService;
    let ticketRepository: any;
    let notificationService: any;
    let natsClient: any;

    const mockTicketRepository = {
        create: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        updateStatus: jest.fn(),
        count: jest.fn(),
    };

    const mockNotificationService = {
        create: jest.fn(),
    };

    const mockNatsClient = {
        emit: jest.fn(),
        send: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketService,
                {
                    provide: TICKET_REPOSITORY_TOKEN,
                    useValue: mockTicketRepository,
                },
                {
                    provide: NOTIFICATION_SERVICE_TOKEN,
                    useValue: mockNotificationService,
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: mockNatsClient,
                },
            ],
        }).compile();

        service = module.get<TicketService>(TicketService);
        ticketRepository = module.get(TICKET_REPOSITORY_TOKEN);
        notificationService = module.get(NOTIFICATION_SERVICE_TOKEN);
        natsClient = module.get('NATS_SERVICE');

        // Spy on Logger to prevent cluttering test output
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createTicket', () => {
        const userId = 'user-1';
        const createDto = {
            title: 'Test Ticket',
            description: 'Test Description',
            type: TicketType.SUPPORT,
        };

        it('should create a support ticket successfully', async () => {
            const mockTicket = { id: 'ticket-1', ...createDto, userId };
            ticketRepository.create.mockResolvedValue(mockTicket);

            const result = await service.createTicket(userId, createDto as any);

            expect(ticketRepository.create).toHaveBeenCalledWith({ ...createDto, userId });
            expect(result).toEqual(mockTicket);
        });

        it('should throw BadRequestException for refund ticket if courseId is missing', async () => {
            const refundDto = {
                title: 'Refund Request',
                description: 'Refund me',
                type: TicketType.REFUND,
                metadata: {},
            };

            await expect(service.createTicket(userId, refundDto as any))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if user is not enrolled for refund ticket', async () => {
            const refundDto = {
                title: 'Refund Request',
                description: 'Refund me',
                type: TicketType.REFUND,
                metadata: { courseId: 'course-1' },
            };

            natsClient.send.mockReturnValue(of(false));

            // Note: service currently masks the 'not enrolled' message with 'Could not verify enrollment status'
            await expect(service.createTicket(userId, refundDto as any))
                .rejects.toThrow('Could not verify enrollment status');

            expect(natsClient.send).toHaveBeenCalledWith(
                { cmd: 'learning.enrollment.isEnrolled' },
                { userId, courseId: 'course-1' }
            );
        });

        it('should create a refund ticket successfully if user is enrolled', async () => {
            const refundDto = {
                title: 'Refund Request',
                description: 'Refund me',
                type: TicketType.REFUND,
                metadata: { courseId: 'course-1' },
            };
            const mockTicket = { id: 'ticket-1', ...refundDto, userId };

            natsClient.send.mockReturnValue(of(true));
            ticketRepository.create.mockResolvedValue(mockTicket);

            const result = await service.createTicket(userId, refundDto as any);

            expect(result).toEqual(mockTicket);
            expect(ticketRepository.create).toHaveBeenCalled();
        });

        it('should throw BadRequestException if NATS enrollment check fails', async () => {
            const refundDto = {
                title: 'Refund Request',
                description: 'Refund me',
                type: TicketType.REFUND,
                metadata: { courseId: 'course-1' },
            };

            natsClient.send.mockReturnValue(throwError(() => new Error('NATS error')));

            await expect(service.createTicket(userId, refundDto as any))
                .rejects.toThrow(new BadRequestException('Could not verify enrollment status'));
        });
    });

    describe('getTicketById', () => {
        it('should return a ticket if found', async () => {
            const mockTicket = { id: 'ticket-1', title: 'Test' };
            ticketRepository.findById.mockResolvedValue(mockTicket);

            const result = await service.getTicketById('ticket-1');

            expect(result).toEqual(mockTicket);
        });

        it('should throw NotFoundException if ticket not found', async () => {
            ticketRepository.findById.mockResolvedValue(null);

            await expect(service.getTicketById('non-existent'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('getTickets', () => {
        it('should return paginated tickets', async () => {
            const query = { page: 1, limit: 10 };
            const mockData = {
                data: [{ id: '1' }],
                total: 1
            };
            ticketRepository.findAll.mockResolvedValue(mockData);

            const result = await service.getTickets(query as any);

            expect(result.data).toEqual(mockData.data);
            expect(result.total).toBe(1);
            expect(result.totalPages).toBe(1);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
        });

        it('should use default values for pagination if not provided', async () => {
            const query = {};
            const mockData = {
                data: [],
                total: 0
            };
            ticketRepository.findAll.mockResolvedValue(mockData);

            const result = await service.getTickets(query as any);

            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
        });
    });

    describe('updateTicketStatus', () => {
        const ticketId = 'ticket-1';
        const handlerId = 'admin-1';
        const updateDto = { status: TicketStatus.APPROVED, response: 'OK' };

        it('should update support ticket status and send notification', async () => {
            const mockTicket = {
                id: ticketId,
                userId: 'user-1',
                status: TicketStatus.PENDING,
                type: TicketType.SUPPORT
            };
            const updatedTicket = { ...mockTicket, status: TicketStatus.APPROVED };

            ticketRepository.findById.mockResolvedValue(mockTicket);
            ticketRepository.updateStatus.mockResolvedValue(updatedTicket);

            const result = await service.updateTicketStatus(ticketId, handlerId, updateDto);

            expect(ticketRepository.updateStatus).toHaveBeenCalledWith(ticketId, updateDto.status, updateDto.response, handlerId);
            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'user-1',
                notificationType: NotificationType.SYSTEM
            }));
            expect(natsClient.emit).toHaveBeenCalledWith({ cmd: 'identity.audit.log' }, expect.any(Object));
            expect(result).toEqual(updatedTicket);
        });

        it('should handle refund ticket approval by deleting enrollment', async () => {
            const mockTicket = {
                id: ticketId,
                userId: 'user-1',
                status: TicketStatus.PENDING,
                type: TicketType.REFUND,
                metadata: { courseId: 'course-1' }
            };
            const updatedTicket = { ...mockTicket, status: TicketStatus.APPROVED };

            ticketRepository.findById.mockResolvedValue(mockTicket);
            ticketRepository.updateStatus.mockResolvedValue(updatedTicket);
            natsClient.send.mockReturnValue(of(true));

            await service.updateTicketStatus(ticketId, handlerId, updateDto as any);

            expect(natsClient.send).toHaveBeenCalledWith(
                { cmd: 'learning.enrollment.delete' },
                { userId: 'user-1', courseId: 'course-1' }
            );
            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                notificationType: NotificationType.PAYMENT
            }));
        });

        it('should continue with ticket approval if enrollment deletion fails with "not found"', async () => {
            const mockTicket = {
                id: ticketId,
                userId: 'user-1',
                status: TicketStatus.PENDING,
                type: TicketType.REFUND,
                metadata: { courseId: 'course-1' }
            };
            const updatedTicket = { ...mockTicket, status: TicketStatus.APPROVED };

            ticketRepository.findById.mockResolvedValue(mockTicket);
            ticketRepository.updateStatus.mockResolvedValue(updatedTicket);
            natsClient.send.mockReturnValue(throwError(() => new Error('enrollment not found')));

            const result = await service.updateTicketStatus(ticketId, handlerId, updateDto as any);

            expect(result).toEqual(updatedTicket);
            expect(ticketRepository.updateStatus).toHaveBeenCalled();
        });

        it('should throw BadRequestException if enrollment deletion fails with other error', async () => {
            const mockTicket = {
                id: ticketId,
                userId: 'user-1',
                status: TicketStatus.PENDING,
                type: TicketType.REFUND,
                metadata: { courseId: 'course-1' }
            };

            ticketRepository.findById.mockResolvedValue(mockTicket);
            natsClient.send.mockReturnValue(throwError(() => new Error('NATS internal error')));

            await expect(service.updateTicketStatus(ticketId, handlerId, updateDto as any))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if ticket is already finalized', async () => {
            const mockTicket = { id: ticketId, status: TicketStatus.APPROVED };
            ticketRepository.findById.mockResolvedValue(mockTicket);

            await expect(service.updateTicketStatus(ticketId, handlerId, updateDto))
                .rejects.toThrow(BadRequestException);
        });

        it('should handle REJECTED status notification correctly', async () => {
            const mockTicket = {
                id: ticketId,
                userId: 'user-1',
                status: TicketStatus.PENDING,
                type: TicketType.SUPPORT
            };
            const updateDtoRejected = { status: TicketStatus.REJECTED, response: 'Invalid request' };
            const updatedTicket = { ...mockTicket, status: TicketStatus.REJECTED };

            ticketRepository.findById.mockResolvedValue(mockTicket);
            ticketRepository.updateStatus.mockResolvedValue(updatedTicket);

            await service.updateTicketStatus(ticketId, handlerId, updateDtoRejected);

            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Yêu cầu hỗ trợ bị từ chối'
            }));
        });

        it('should handle PROCESSING status notification correctly', async () => {
            const mockTicket = {
                id: ticketId,
                userId: 'user-1',
                status: TicketStatus.PENDING,
                type: TicketType.SUPPORT
            };
            const updateDtoProcessing = { status: TicketStatus.PROCESSING, response: '' };
            const updatedTicket = { ...mockTicket, status: TicketStatus.PROCESSING };

            ticketRepository.findById.mockResolvedValue(mockTicket);
            ticketRepository.updateStatus.mockResolvedValue(updatedTicket);

            await service.updateTicketStatus(ticketId, handlerId, updateDtoProcessing);

            expect(notificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Yêu cầu đang được xử lý'
            }));
        });
    });

    describe('getTicketStats', () => {
        it('should return ticket statistics', async () => {
            ticketRepository.count.mockResolvedValueOnce(5); // pending
            ticketRepository.count.mockResolvedValueOnce(2); // refund
            ticketRepository.count.mockResolvedValueOnce(10); // total

            const result = await service.getTicketStats();

            expect(result).toEqual({
                pendingCount: 5,
                refundCount: 2,
                totalCount: 10
            });
            expect(ticketRepository.count).toHaveBeenCalledTimes(3);
        });
    });
});
