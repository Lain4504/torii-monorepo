import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from '../src/modules/audit/audit-log.service';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '../src/interfaces/repositories';
import { Prisma } from '@prisma/generated'; // Adjust import based on your project structure, strictly following the service file imports
import { Logger } from '@nestjs/common';

// Define the mock repository
const mockAuditLogRepository = {
  create: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  findByUserId: jest.fn(),
  findByEntity: jest.fn(),
};

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repository: typeof mockAuditLogRepository;

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
    repository = module.get(AUDIT_LOG_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should call repository.create with correct filtered values', async () => {
      const entry = {
        userId: 'user-1',
        action: 'UPDATE',
        entity: 'Course',
        entityId: 'course-1',
        description: 'Updated course',
        oldValues: { title: 'Old Title', updatedAt: new Date('2023-01-01') },
        newValues: { title: 'New Title', updatedAt: new Date('2023-01-02') },
      };

      await service.log(entry);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: { connect: { id: entry.userId } },
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          description: entry.description,
          oldValues: { title: 'Old Title' }, // updatedAt should be removed
          newValues: { title: 'New Title' }, // updatedAt should be removed
        }),
      );
    });

    it('should handle null values correctly', async () => {
      const entry = {
        userId: 'user-1',
        action: 'DELETE',
        entity: 'Course',
        entityId: 'course-1',
        description: 'Deleted course',
        oldValues: undefined,
        newValues: undefined,
      };

      await service.log(entry);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          oldValues: Prisma.DbNull,
          newValues: Prisma.DbNull,
        }),
      );
    });

    it('should catch and log errors during creation', async () => {
      const entry = {
        userId: 'user-1',
        action: 'CREATE',
        entity: 'Course',
        entityId: 'course-1',
        description: 'Created course',
      };

      const error = new Error('Database error');
      repository.create.mockRejectedValue(error);

      // Spy on logger
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => {});
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await service.log(entry);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to create audit log:',
        error,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Audit log creation failed:',
        error,
      );

      loggerSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('query', () => {
    it('should return paginated results with default pagination', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          userId: 'user-1',
          action: 'CREATE',
          entity: 'Course',
          entityId: 'course-1',
          createdAt: new Date(),
          user: {
            id: 'user-1',
            email: 'test@example.com',
            displayName: 'Test User',
            role: 'USER',
          },
        },
      ];
      const total = 1;

      repository.findMany.mockResolvedValue(mockLogs);
      repository.count.mockResolvedValue(total);

      const result = await service.query({});

      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should apply filters correctly', async () => {
      const filters = {
        userId: 'user-1',
        action: 'UPDATE',
        entity: 'Course',
        page: 2,
        limit: 10,
      };

      repository.findMany.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      await service.query(filters);

      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            action: 'UPDATE',
            entity: 'Course',
          }),
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should apply date filters correctly', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      repository.findMany.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      await service.query({ startDate, endDate });

      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity', async () => {
      const userId = 'user-1';
      const mockActivity = [{ id: 'log-1', action: 'LOGIN' }];

      repository.findByUserId.mockResolvedValue(mockActivity);

      const result = await service.getUserActivity(userId);

      expect(repository.findByUserId).toHaveBeenCalledWith(userId, 20);
      expect(result).toEqual(mockActivity);
    });
  });

  describe('getEntityActivity', () => {
    it('should return entity activity', async () => {
      const entity = 'Course';
      const entityId = 'course-1';
      const mockActivity = [{ id: 'log-1', action: 'UPDATE' }];

      repository.findByEntity.mockResolvedValue(mockActivity);

      const result = await service.getEntityActivity(entity, entityId);

      expect(repository.findByEntity).toHaveBeenCalledWith(
        entity,
        entityId,
        20,
      );
      expect(result).toEqual(mockActivity);
    });
  });
});
