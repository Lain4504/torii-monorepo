import { Test, TestingModule } from '@nestjs/testing';
import { LiveSessionService } from '@server/learning/modules/live-session/live-session.service';
import { LIVE_SESSION_REPOSITORY_TOKEN, COURSE_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { PrismaService } from '@server/shared';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole, LiveSessionStatus } from '@workspace/schemas';
import { of } from 'rxjs';

describe('LiveSessionService', () => {
    let service: LiveSessionService;
    let liveSessionRepository: any;
    let courseRepository: any;
    let prismaService: any;
    let natsClient: any;

    const mockLiveSessionRepository = {
        findById: jest.fn(),
        update: jest.fn(),
    };

    const mockCourseRepository = {
        findById: jest.fn(),
    };

    const mockPrismaService = {
        enrollment: {
            findUnique: jest.fn(),
        },
        liveSession: {
            findMany: jest.fn(),
        }
    };

    const mockNatsClient = {
        send: jest.fn(),
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LiveSessionService,
                { provide: LIVE_SESSION_REPOSITORY_TOKEN, useValue: mockLiveSessionRepository },
                { provide: COURSE_REPOSITORY_TOKEN, useValue: mockCourseRepository },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: 'NATS_SERVICE', useValue: mockNatsClient },
            ],
        }).compile();

        service = module.get<LiveSessionService>(LiveSessionService);
        liveSessionRepository = module.get(LIVE_SESSION_REPOSITORY_TOKEN);
        courseRepository = module.get(COURSE_REPOSITORY_TOKEN);
        prismaService = module.get(PrismaService);
        natsClient = module.get('NATS_SERVICE');

        // Mock natsClient.send for joinSession flow
        mockNatsClient.send.mockImplementation((pattern) => {
            if (pattern.cmd === 'user.generateJoinToken') return of({ token: 'mock-token' });
            if (pattern.cmd === 'room.getRoomInfo') return of({ sid: 'mock-sid' });
            return of({});
        });
    });

    describe('joinSession', () => {
        const userId = 'user-1';
        const sessionId = 'session-1';
        const courseId = 'course-1';
        const requester = { sub: userId, role: UserRole.LEARNER, permissions: [] };

        it('should allow staff/admin to join without enrollment checks', async () => {
            const admin = { sub: 'admin-1', role: UserRole.ADMIN, permissions: ['*'] };
            mockLiveSessionRepository.findById.mockResolvedValue({ 
                id: sessionId, 
                courseId, 
                meetingId: 'm1', 
                title: 'Session',
                status: (LiveSessionStatus as any).LIVE
            });
            mockCourseRepository.findById.mockResolvedValue({ id: courseId });

            const result = await service.joinSession(admin as any, sessionId);
            expect(result).toBeDefined();
            expect(prismaService.enrollment.findUnique).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if enrollment has expired', async () => {
            mockLiveSessionRepository.findById.mockResolvedValue({ 
                id: sessionId, 
                courseId, 
                meetingId: 'm1',
                status: (LiveSessionStatus as any).LIVE
            });
            mockCourseRepository.findById.mockResolvedValue({ id: courseId });
            mockPrismaService.enrollment.findUnique.mockResolvedValue({
                id: 'enr-1',
                expiresAt: new Date(Date.now() - 1000) // Expired
            });

            await expect(service.joinSession(requester as any, sessionId))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException if course has not started yet', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            
            mockLiveSessionRepository.findById.mockResolvedValue({ 
                id: sessionId, 
                courseId, 
                meetingId: 'm1',
                status: (LiveSessionStatus as any).LIVE
            });
            mockCourseRepository.findById.mockResolvedValue({ id: courseId });
            mockPrismaService.enrollment.findUnique.mockResolvedValue({
                id: 'enr-1',
                expiresAt: new Date(Date.now() + 100000), // Valid
                course: { startDate: futureDate }
            });

            await expect(service.joinSession(requester as any, sessionId))
                .rejects.toThrow(ForbiddenException);
        });

        it('should allow students with valid enrollment and started course', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            mockLiveSessionRepository.findById.mockResolvedValue({ 
                id: sessionId, 
                courseId, 
                meetingId: 'm1', 
                title: 'Session',
                status: (LiveSessionStatus as any).LIVE
            });
            mockCourseRepository.findById.mockResolvedValue({ id: courseId });
            mockPrismaService.enrollment.findUnique.mockResolvedValue({
                id: 'enr-1',
                expiresAt: new Date(Date.now() + 100000),
                course: { startDate: pastDate }
            });

            const result = await service.joinSession(requester as any, sessionId);
            expect(result).toBeDefined();
            expect(result.token).toBe('mock-token');
        });
    });
});
