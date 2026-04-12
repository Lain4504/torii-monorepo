import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { TicketService } from '../src/modules/ticket/ticket.service';
import { ITicketRepository, TICKET_REPOSITORY_TOKEN } from '@server/academy/interfaces/repositories';
import { PrismaService } from '@server/shared';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { EmailService } from '@server/identity/modules/email/email.service';
import { TicketType, TicketStatus } from '@workspace/schemas';

describe('TicketService', () => {
  let service: TicketService;
  let mockRepository: any;
  let mockPrisma: any;
  let mockNats: any;
  let mockAudit: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    };

    mockPrisma = {
      liveClass: { 
          findUnique: jest.fn().mockResolvedValue({ 
              id: 'c1', status: 'OPENING', 
              cohort: { enrollmentOpenAt: null, enrollmentCloseAt: null } 
          }) 
      },
      vodPackage: { findUnique: jest.fn() },
      enrollment: { findUnique: jest.fn(), update: jest.fn() },
      order: { findUnique: jest.fn(), update: jest.fn() },
      user: { update: jest.fn() },
      walletTransaction: { create: jest.fn() },
      userLessonProgress: { deleteMany: jest.fn() },
      academyExamAttempt: { deleteMany: jest.fn() },
      learningRoadmap: { deleteMany: jest.fn() },
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
    };

    mockNats = {
      send: jest.fn(),
      emit: jest.fn(),
    };

    mockAudit = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: TICKET_REPOSITORY_TOKEN, useValue: mockRepository },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLoggerService, useValue: mockAudit },
        { provide: 'NATS_SERVICE', useValue: mockNats },
        { provide: EmailService, useValue: {} },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket (Refund Validation)', () => {
    it('should throw if progress > 20%', async () => {
      mockNats.send.mockImplementation((pattern) => {
        if (pattern.cmd === 'academy.enrollment.checkByTarget') {
          return of({
            isEnrolled: true,
            enrollment: { enrolledAt: new Date(), progress: 50, id: 'e1' }
          });
        }
        return of({});
      });

      await expect(service.createTicket('u1', { 
        type: TicketType.REFUND, subject: 'S', content: 'C', 
        liveClassId: 'c1'
      } as any)).rejects.toThrow('không đủ điều kiện hoàn tiền do bạn đã hoàn thành 50%');
    });

    it('should throw if diffDays > 14', async () => {
        const longAgo = new Date();
        longAgo.setDate(longAgo.getDate() - 20);

        mockNats.send.mockReturnValue(of({
          isEnrolled: true,
          enrollment: { enrolledAt: longAgo, progress: 0, id: 'e1' }
        }));
  
        await expect(service.createTicket('u1', { 
          type: TicketType.REFUND, subject: 'S', content: 'C', 
          liveClassId: 'c1'
        } as any)).rejects.toThrow('trong vòng 14 ngày');
      });

    it('should lock enrollment status to REFUND_PENDING on success', async () => {
        mockNats.send.mockReturnValue(of({
            isEnrolled: true,
            enrollment: { enrolledAt: new Date(), progress: 0, id: 'e1' }
        }));
        mockRepository.create.mockResolvedValue({ id: 't1' });

        await service.createTicket('u1', { 
            type: TicketType.REFUND, subject: 'S', content: 'C', 
            liveClassId: 'c1'
        } as any);

        expect(mockPrisma.enrollment.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'e1' },
            data: { status: 'REFUND_PENDING' }
        }));
    });
  });

  describe('updateTicketStatus (Resolved Refund)', () => {
    it('should credit wallet and clear progress when resolved', async () => {
      const ticket = { 
          id: 't1', type: TicketType.REFUND, userId: 'u1', status: TicketStatus.PENDING,
          orderId: 'o1', metadata: { vodPackageId: 'v1', courseTitle: 'Course' },
          refundAmount: 50000 
      };
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.updateStatus.mockResolvedValue(ticket);
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1', status: 'REFUND_PENDING' });

      await service.updateTicketStatus('t1', 'admin1', { status: TicketStatus.RESOLVED });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
          where: { id: 'u1' },
          data: { walletBalance: { increment: 50000 } }
      }));
      expect(mockPrisma.userLessonProgress.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.enrollment.update).toHaveBeenCalledWith(expect.objectContaining({
          data: { status: 'CANCELLED' }
      }));
    });
  });

  describe('updateTicketStatus (Cancelled Refund)', () => {
    it('should restore original enrollment status if refund ticket is cancelled', async () => {
        const ticket = { 
            id: 't1', type: TicketType.REFUND, userId: 'u1', status: TicketStatus.PENDING,
            metadata: { vodPackageId: 'v1', originalStatus: 'ACTIVE' }
        };
        mockRepository.findById.mockResolvedValue(ticket);
        mockRepository.updateStatus.mockResolvedValue(ticket);
        mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1', status: 'REFUND_PENDING' });
  
        await service.updateTicketStatus('t1', 'admin1', { status: TicketStatus.CANCELLED });
  
        expect(mockPrisma.enrollment.update).toHaveBeenCalledWith(expect.objectContaining({
            data: { status: 'ACTIVE' }
        }));
    });
  });
});
