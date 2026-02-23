import { Test, TestingModule } from '@nestjs/testing';
import { LessonMaterialService } from '@server/learning/modules/lesson-material/lesson-material.service';
import { LESSON_MATERIAL_REPOSITORY_TOKEN, MODULE_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { ENROLLMENT_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';

const mockMapper = {
    map: jest.fn().mockImplementation((val) => val),
};

describe('LessonMaterialService', () => {
    let service: LessonMaterialService;
    let enrollmentService: any;
    let prisma: any;

    // Material mock must include fileAsset (required by toLessonMaterialResponseDTO)
    const mockMaterial = {
        id: 'mat-1',
        lessonId: 'les-1',
        type: 'SLIDE',
        title: 'Slides',
        fileAssetId: 'asset-1',
        orderIndex: 1,
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        fileAsset: {
            id: 'asset-1',
            fileUrl: 'https://cdn.example.com/slide.pdf',
            mimeType: 'application/pdf',
            fileSize: 1200,
            status: 'ACTIVE',
        },
    };

    const mockLessonMaterialRepository = {
        findByLessonId: jest.fn().mockResolvedValue([mockMaterial]),
        checkLecturerAccess: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockEnrollmentService = {
        isEnrolled: jest.fn(),
    };

    const mockModuleRepository = {
        findById: jest.fn(),
    };

    const mockNatsClient = {
        emit: jest.fn(),
        send: jest.fn().mockReturnValue({ pipe: jest.fn(), subscribe: jest.fn() }),
    };

    const mockPrisma = {
        lesson: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LessonMaterialService,
                { provide: LESSON_MATERIAL_REPOSITORY_TOKEN, useValue: mockLessonMaterialRepository },
                { provide: ENROLLMENT_SERVICE_TOKEN, useValue: mockEnrollmentService },
                { provide: MODULE_REPOSITORY_TOKEN, useValue: mockModuleRepository },
                { provide: 'NATS_SERVICE', useValue: mockNatsClient },
                { provide: PrismaService, useValue: mockPrisma },
                { provide: getMapperToken(), useValue: mockMapper },
            ],
        }).compile();

        service = module.get<LessonMaterialService>(LessonMaterialService);
        enrollmentService = module.get(ENROLLMENT_SERVICE_TOKEN);
        prisma = module.get(PrismaService);

        jest.clearAllMocks();
        // Re-apply default mock values after clearAllMocks
        mockLessonMaterialRepository.findByLessonId.mockResolvedValue([mockMaterial]);
    });

    it('nên được định nghĩa', () => {
        expect(service).toBeDefined();
    });

    describe('findByLessonId - Content Protection', () => {
        it('Bài preview: bất kỳ ai (không có userId) cũng truy cập được tài liệu', async () => {
            mockPrisma.lesson.findUnique.mockResolvedValue({
                id: 'les-1',
                isPreview: true,
                deletedAt: null,
                module: { courseId: 'course-1' },
            });

            const result = await service.findByLessonId('les-1', undefined);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('mat-1');
        });

        it('Bài không phải preview, không có userId: nên ném ForbiddenException', async () => {
            mockPrisma.lesson.findUnique.mockResolvedValue({
                id: 'les-1',
                isPreview: false,
                deletedAt: null,
                module: { courseId: 'course-1' },
            });

            await expect(service.findByLessonId('les-1', undefined))
                .rejects.toThrow(ForbiddenException);
        });

        it('Bài không phải preview, người dùng chưa enrolled: nên ném ForbiddenException', async () => {
            mockPrisma.lesson.findUnique.mockResolvedValue({
                id: 'les-1',
                isPreview: false,
                isUnlocked: true,
                deletedAt: null,
                module: { courseId: 'course-1' },
            });
            mockEnrollmentService.isEnrolled.mockResolvedValue(false);
            const requester = { sub: 'user-stranger', role: 'LEARNER' as any, permissions: [] };

            await expect(service.findByLessonId('les-1', requester))
                .rejects.toThrow(ForbiddenException);
        });

        it('Bài không phải preview, người dùng đã enrolled: nên trả về danh sách tài liệu', async () => {
            mockPrisma.lesson.findUnique.mockResolvedValue({
                id: 'les-1',
                isPreview: false,
                isUnlocked: true,
                deletedAt: null,
                module: { courseId: 'course-1' },
            });
            mockEnrollmentService.isEnrolled.mockResolvedValue(true);
            const requester = { sub: 'user-enrolled', role: 'LEARNER' as any, permissions: [] };

            const result = await service.findByLessonId('les-1', requester);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('mat-1');
            expect(result[0].fileAsset.fileUrl).toBe('https://cdn.example.com/slide.pdf');
        });

        it('Lesson không tồn tại (null): nên ném NotFoundException', async () => {
            mockPrisma.lesson.findUnique.mockResolvedValue(null);
            const requester = { sub: 'user-1', role: 'LEARNER' as any, permissions: [] };

            await expect(service.findByLessonId('non-existent', requester))
                .rejects.toThrow(NotFoundException);
        });

        it('Lesson đã bị khóa (isUnlocked=false): nên ném ForbiddenException cho Learner', async () => {
            mockPrisma.lesson.findUnique.mockResolvedValue({
                id: 'les-1',
                isPreview: false,
                isUnlocked: false,
                deletedAt: null,
                module: { courseId: 'course-1' },
            });
            const requester = { sub: 'user-enrolled', role: 'LEARNER' as any, permissions: [] };

            await expect(service.findByLessonId('les-1', requester))
                .rejects.toThrow(ForbiddenException);
        });

        it('Lesson đã bị khóa (isUnlocked=false): Staff vẫn truy cập được', async () => {
            mockPrisma.lesson.findUnique.mockResolvedValue({
                id: 'les-1',
                isPreview: false,
                isUnlocked: false,
                deletedAt: null,
                module: { courseId: 'course-1' },
            });
            const requester = { sub: 'staff-1', role: 'STAFF' as any, permissions: ['lesson.update'] };

            const result = await service.findByLessonId('les-1', requester);
            expect(result).toHaveLength(1);
        });

        it('Lesson đã bị xóa mềm (deletedAt != null): nên ném NotFoundException', async () => {
            mockPrisma.lesson.findUnique.mockResolvedValue({
                id: 'les-1',
                isPreview: false,
                deletedAt: new Date(),
                module: { courseId: 'course-1' },
            });
            const requester = { sub: 'user-1', role: 'LEARNER' as any, permissions: [] };

            await expect(service.findByLessonId('les-1', requester))
                .rejects.toThrow(NotFoundException);
        });
    });
});
