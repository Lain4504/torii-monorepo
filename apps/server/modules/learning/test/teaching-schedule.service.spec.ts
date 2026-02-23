import { Test, TestingModule } from '@nestjs/testing';
import { TeachingScheduleService } from '@server/learning/modules/teaching-schedule/teaching-schedule.service';
import { PrismaService } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import { ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@workspace/schemas';

describe('TeachingScheduleService', () => {
    let service: TeachingScheduleService;
    let prisma: any;
    let mapper: any;

    const mockSchedule = {
        id: 'ts-1',
        courseId: 'c-1',
        lecturerId: 'l-1',
        dayOfWeek: 1,
        startTime: '09:00',
        duration: 90,
        course: { title: 'JS Course' },
    };

    const mockRequester = {
        sub: 'staff-1',
        role: UserRole.STAFF,
        permissions: ['live_class.schedule'],
    };

    const mockPrismaService = {
        teachingSchedule: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        liveSession: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        liveSessionScheduleRequest: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };

    const mockMapper = {
        map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeachingScheduleService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: getMapperToken(),
                    useValue: mockMapper,
                },
            ],
        }).compile();

        service = module.get<TeachingScheduleService>(TeachingScheduleService);
        prisma = module.get(PrismaService);
        mapper = module.get(getMapperToken());

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkAvailability', () => {
        it('should return available true if no conflicts', async () => {
            mockPrismaService.teachingSchedule.findMany.mockResolvedValue([]);
            const result = await service.checkAvailability('l-1', 1, '09:00', 90);
            expect(result.available).toBe(true);
        });

        it('should return available false if conflict exists', async () => {
            mockPrismaService.teachingSchedule.findMany.mockResolvedValue([mockSchedule]);
            const result = await service.checkAvailability('l-1', 1, '09:30', 60);
            expect(result.available).toBe(false);
            expect(result.conflicts).toHaveLength(1);
        });
    });

    describe('assignSchedule', () => {
        it('should assign schedule if available', async () => {
            mockPrismaService.teachingSchedule.findMany.mockResolvedValue([]); // Availability
            mockPrismaService.teachingSchedule.create.mockResolvedValue(mockSchedule);
            mockPrismaService.teachingSchedule.findUnique.mockResolvedValue(mockSchedule); // For generation

            const result = await service.assignSchedule(mockRequester as any, {
                courseId: 'c-1',
                lecturerId: 'l-1',
                dayOfWeek: 1,
                startTime: '09:00',
                duration: 90,
            });

            expect(result.id).toBe(mockSchedule.id);
            expect(prisma.teachingSchedule.create).toHaveBeenCalled();
            expect(prisma.liveSession.createMany).toHaveBeenCalled();
        });

        it('should throw ConflictException if unavailable', async () => {
            mockPrismaService.teachingSchedule.findMany.mockResolvedValue([mockSchedule]);
            await expect(service.assignSchedule(mockRequester as any, {
                courseId: 'c-2',
                lecturerId: 'l-1',
                dayOfWeek: 1,
                startTime: '09:00',
                duration: 90,
            })).rejects.toThrow(ConflictException);
        });
    });

    describe('removeSchedule', () => {
        it('should remove schedule and future sessions', async () => {
            mockPrismaService.teachingSchedule.findUnique.mockResolvedValue(mockSchedule);
            await service.removeSchedule(mockRequester as any, 'ts-1');
            expect(prisma.liveSession.deleteMany).toHaveBeenCalled();
            expect(prisma.teachingSchedule.delete).toHaveBeenCalledWith({ where: { id: 'ts-1' } });
        });
    });
});
