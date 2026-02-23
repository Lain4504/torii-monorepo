import { Test, TestingModule } from '@nestjs/testing';
import { ModuleService } from '@server/learning/modules/module/module.service';
import { MODULE_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { COURSE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@workspace/schemas';
import { getMapperToken } from '@automapper/nestjs';

const mockMapper = {
    map: jest.fn().mockImplementation((val) => val),
};

describe('ModuleService', () => {
    let service: ModuleService;
    let moduleRepository: any;
    let courseService: any;
    let natsClient: any;

    // Mock Dependencies
    const mockModuleRepository = {
        create: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        findByCourseId: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        softDelete: jest.fn(),
        count: jest.fn(),
        reorder: jest.fn(),
        getMaxOrderIndex: jest.fn(),
    };

    const mockCourseService = {
        recalculateStats: jest.fn(),
        isInstructor: jest.fn(),
    };

    const mockNatsClient = {
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ModuleService,
                { provide: MODULE_REPOSITORY_TOKEN, useValue: mockModuleRepository },
                { provide: COURSE_SERVICE_TOKEN, useValue: mockCourseService },
                { provide: 'NATS_SERVICE', useValue: mockNatsClient },
                { provide: getMapperToken(), useValue: mockMapper },
            ],
        }).compile();

        service = module.get<ModuleService>(ModuleService);
        moduleRepository = module.get(MODULE_REPOSITORY_TOKEN);
        courseService = module.get(COURSE_SERVICE_TOKEN);
        natsClient = module.get('NATS_SERVICE');

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const dto = {
            courseId: 'course-1',
            title: 'Introduction Module',
            description: 'First module',
        };
        const requester = { sub: 'user-1', role: UserRole.STAFF, permissions: [] };

        it('should create a module successfully and update course stats', async () => {
            mockModuleRepository.getMaxOrderIndex.mockResolvedValue(0);
            mockModuleRepository.create.mockResolvedValue({
                id: 'mod-1',
                ...dto,
                orderIndex: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const result = await service.create(requester as any, dto as any);

            expect(result).toBeDefined();
            expect(result.id).toBe('mod-1');
            expect(moduleRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                title: dto.title,
                orderIndex: 1,
                createdBy: 'user-1'
            }));
            expect(courseService.recalculateStats).toHaveBeenCalledWith('course-1');
            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'identity.audit.log' },
                expect.objectContaining({ action: 'course_module.create' })
            );
        });

        it('should handle errors during creation', async () => {
            mockModuleRepository.getMaxOrderIndex.mockRejectedValue(new Error('DB Error'));

            await expect(service.create(requester as any, dto as any))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('update', () => {
        const requester = { sub: 'inst-1', role: UserRole.LECTURER, permissions: ['module.update'] };
        const moduleId = 'mod-1';
        const updateDto = { title: 'Updated Module Title' };

        it('should update module successfully if instructor is assigned', async () => {
            const existingModule = { id: moduleId, courseId: 'course-1', title: 'Old Title' };

            mockModuleRepository.findById.mockResolvedValue(existingModule);
            mockCourseService.isInstructor.mockResolvedValue(true);
            mockModuleRepository.update.mockResolvedValue({
                ...existingModule,
                ...updateDto,
                updatedAt: new Date()
            });

            const result = await service.update(requester as any, moduleId, updateDto);

            expect(result.title).toBe(updateDto.title);
            expect(courseService.isInstructor).toHaveBeenCalledWith('inst-1', 'course-1');
        });

        it('should throw ForbiddenException if user is not assigned to course', async () => {
            const existingModule = { id: moduleId, courseId: 'course-1' };

            mockModuleRepository.findById.mockResolvedValue(existingModule);
            mockCourseService.isInstructor.mockResolvedValue(false); // Not instructor

            await expect(service.update(requester as any, moduleId, updateDto))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException if module does not exist', async () => {
            mockModuleRepository.findById.mockResolvedValue(null);

            await expect(service.update(requester as any, moduleId, updateDto))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if user lacks "module.update" permission', async () => {
            const weakRequester = { sub: 'user-2', role: UserRole.LEARNER, permissions: [] };

            await expect(service.update(weakRequester as any, moduleId, updateDto))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('delete', () => {
        const requester = { sub: 'admin-1', role: UserRole.ADMIN, permissions: ['module.delete'] };
        const moduleId = 'mod-1';

        it('should soft delete module successfully', async () => {
            const existingModule = { id: moduleId, courseId: 'course-1', title: 'To Delete' };
            mockModuleRepository.findById.mockResolvedValue(existingModule);
            mockModuleRepository.softDelete.mockResolvedValue(existingModule);

            const result = await service.delete(requester as any, moduleId, false);

            expect(result.message).toContain('successfully');
            expect(moduleRepository.softDelete).toHaveBeenCalledWith(moduleId);
            expect(courseService.recalculateStats).toHaveBeenCalledWith('course-1');
        });

        it('should hard delete module successfully', async () => {
            const existingModule = { id: moduleId, courseId: 'course-1', title: 'To Delete' };
            mockModuleRepository.findById.mockResolvedValue(existingModule);
            mockModuleRepository.delete.mockResolvedValue(existingModule);

            const result = await service.delete(requester as any, moduleId, true);

            expect(result.message).toContain('successfully');
            expect(moduleRepository.delete).toHaveBeenCalledWith(moduleId);
            expect(courseService.recalculateStats).toHaveBeenCalledWith('course-1');
        });

        it('should throw ForbiddenException if user lacks delete permission', async () => {
            const weakRequester = { sub: 'user-2', role: UserRole.LEARNER, permissions: [] };

            await expect(service.delete(weakRequester as any, moduleId))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('reorder', () => {
        const requester = { sub: 'staff-1', role: UserRole.STAFF, permissions: ['module.update'] };
        const courseId = 'course-1';
        const orders = [{ id: 'mod-1', orderIndex: 1 }, { id: 'mod-2', orderIndex: 2 }];

        it('should reorder modules successfully', async () => {
            mockModuleRepository.reorder.mockResolvedValue(undefined);

            const result = await service.reorder(requester as any, courseId, orders);

            expect(result.message).toContain('reordered successfully');
            expect(moduleRepository.reorder).toHaveBeenCalledWith(courseId, orders);
            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'identity.audit.log' },
                expect.objectContaining({ action: 'course_module.reorder' })
            );
        });

        it('should throw ForbiddenException if user lacks update permission', async () => {
            const weakRequester = { sub: 'user-2', role: UserRole.LEARNER, permissions: [] };

            await expect(service.reorder(weakRequester as any, courseId, orders))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('findAll', () => {
        it('should return paginated modules', async () => {
            const options = { page: 1, limit: 10 };
            mockModuleRepository.count.mockResolvedValue(20);
            mockModuleRepository.findMany.mockResolvedValue([
                { id: '1', title: 'Module 1' },
                { id: '2', title: 'Module 2' }
            ]);

            const result = await service.findAll(options);

            expect(result.total).toBe(20);
            expect(result.totalPages).toBe(2);
            expect(result.data).toHaveLength(2);
            expect(moduleRepository.findMany).toHaveBeenCalled();
        });
    });
});
