import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from '../src/modules/audit/audit-log.service';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '../src/interfaces/repositories';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/generated';
import { AuditLogEntryDTO, AuditLogFiltersDTO } from '@workspace/schemas';

describe('AuditLogService', () => {
    let service: AuditLogService;
    let auditLogRepository: any;

    const mockAuditLogRepository = {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findByUserId: jest.fn(),
        findByEntity: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditLogService,
                {
                    provide: AUDIT_LOG_REPOSITORY_TOKEN,
                    useValue: mockAuditLogRepository,
                },
            ],
        }).compile();

        service = module.get<AuditLogService>(AuditLogService);
        auditLogRepository = module.get(AUDIT_LOG_REPOSITORY_TOKEN);

        jest.clearAllMocks();

        // Spy on Logger and console to prevent noise during tests
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('log', () => {
        const baseEntry: AuditLogEntryDTO = {
            userId: 'user-1',
            action: 'CREATE',
            entity: 'Post',
            entityId: 'post-1',
            description: 'Created a post',
            oldValues: undefined,
            newValues: { title: 'New Post' },
            metadata: { ip: '127.0.0.1' },
        };

        it('nên tạo log thành công với dữ liệu hợp lệ', async () => {
            mockAuditLogRepository.create.mockResolvedValue({ id: 'log-1', ...baseEntry });

            await service.log(baseEntry);

            expect(auditLogRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                user: { connect: { id: baseEntry.userId } },
                action: baseEntry.action,
                entity: baseEntry.entity,
                entityId: baseEntry.entityId,
                description: baseEntry.description,
                metadata: baseEntry.metadata,
                newValues: baseEntry.newValues,
            }));
        });

        it('nên lọc bỏ các trường nhiễu (noise fields)', async () => {
            const entryWithNoise = {
                ...baseEntry,
                oldValues: { id: 1, createdAt: '2023', name: 'Old' },
                newValues: { id: 1, updatedAt: '2024', name: 'New' },
            };

            await service.log(entryWithNoise);

            expect(auditLogRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                oldValues: { name: 'Old' },
                newValues: { name: 'New' },
            }));
        });

        it('nên chỉ lưu các trường có thay đổi (diff)', async () => {
            const entryWithDiff = {
                ...baseEntry,
                oldValues: { name: 'Keep', age: 20 },
                newValues: { name: 'Keep', age: 21 },
            };

            await service.log(entryWithDiff);

            expect(auditLogRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                oldValues: { age: 20 },
                newValues: { age: 21 },
            }));
        });

        it('nên xử lý lỗi gracefully khi repository ném lỗi', async () => {
            mockAuditLogRepository.create.mockRejectedValue(new Error('DB Error'));

            // Hàm log có try-catch nên không throw lỗi ra ngoài
            await expect(service.log(baseEntry)).resolves.not.toThrow();
            expect(Logger.prototype.error).toHaveBeenCalled();
        });

        it('nên xử lý trường hợp không có oldValues hoặc newValues', async () => {
            const entry = { ...baseEntry, oldValues: undefined, newValues: undefined };
            await service.log(entry);

            expect(auditLogRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                oldValues: Prisma.DbNull,
                newValues: Prisma.DbNull,
            }));
        });
    });

    describe('query', () => {
        const mockAuditLogs = [
            {
                id: 'log-1',
                userId: 'user-1',
                action: 'create',
                entity: 'post',
                entityId: 'post-1',
                createdAt: new Date(),
                user: { id: 'user-1', email: 'test@test.com', displayName: 'Test', role: 'USER' },
            },
        ];

        it('nên trả về kết quả phân trang mặc định', async () => {
            mockAuditLogRepository.findMany.mockResolvedValue(mockAuditLogs);
            mockAuditLogRepository.count.mockResolvedValue(1);

            const result = await service.query({});

            expect(result).toEqual({
                data: expect.any(Array),
                total: 1,
                page: 1,
                limit: 50,
                totalPages: 1,
            });
            expect(auditLogRepository.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 50,
            }));
        });

        it('nên áp dụng các bộ lọc (userId, action, entity)', async () => {
            mockAuditLogRepository.findMany.mockResolvedValue([]);
            mockAuditLogRepository.count.mockResolvedValue(0);

            const filters: AuditLogFiltersDTO = {
                userId: 'user-1',
                action: 'UPDATE',
                entity: 'Post',
                page: 1,
                limit: 10,
            };

            await service.query(filters);

            expect(auditLogRepository.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    userId: 'user-1',
                    action: 'UPDATE',
                    entity: 'Post',
                }),
            }));
        });

        it('nên áp dụng bộ lọc ngày tháng (startDate, endDate)', async () => {
            mockAuditLogRepository.findMany.mockResolvedValue([]);
            mockAuditLogRepository.count.mockResolvedValue(0);

            const filters: AuditLogFiltersDTO = {
                startDate: new Date('2023-01-01'),
                endDate: new Date('2023-12-31'),
            };

            await service.query(filters);

            expect(auditLogRepository.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    createdAt: expect.objectContaining({
                        gte: expect.any(Date),
                        lte: expect.any(Date),
                    }),
                }),
            }));
        });
    });

    describe('getUserActivity', () => {
        it('nên gọi repository.findByUserId', async () => {
            const mockActivities = [{ id: '1', action: 'LOGIN' }];
            mockAuditLogRepository.findByUserId.mockResolvedValue(mockActivities);

            const result = await service.getUserActivity('user-1', 10);

            expect(auditLogRepository.findByUserId).toHaveBeenCalledWith('user-1', 10);
            expect(result).toEqual(mockActivities);
        });
    });

    describe('getEntityActivity', () => {
        it('nên gọi repository.findByEntity', async () => {
            const mockActivities = [{ id: '1', action: 'UPDATE' }];
            mockAuditLogRepository.findByEntity.mockResolvedValue(mockActivities);

            const result = await service.getEntityActivity('Post', 'post-1', 5);

            expect(auditLogRepository.findByEntity).toHaveBeenCalledWith('Post', 'post-1', 5);
            expect(result).toEqual(mockActivities);
        });
    });
});
