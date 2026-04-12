import { Test, TestingModule } from '@nestjs/testing';
import { ResourceService } from '../src/modules/resource/resource.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { STORAGE_SERVICE_TOKEN, IStorageService } from '@server/academy/interfaces/services/i-storage.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ResourceService', () => {
  let service: ResourceService;
  let prisma: PrismaService;
  let audit: AuditLoggerService;
  let storageService: IStorageService;

  const mockPrisma = {
    academyFolder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    liveClass: {
      findMany: jest.fn(),
    },
    vodPackage: {
      findMany: jest.fn(),
    },
    enrollment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    academyResource: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  };

  const mockAudit = {
    log: jest.fn(),
  };

  const mockStorageService = {
    getSignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLoggerService, useValue: mockAudit },
        { provide: STORAGE_SERVICE_TOKEN, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditLoggerService>(AuditLoggerService);
    storageService = module.get<IStorageService>(STORAGE_SERVICE_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFolder', () => {
    it('should create a folder', async () => {
      const dto = { name: 'Folder 1', type: 'GENERAL', ownerType: 'LIVE_CLASS', ownerId: 'c1' };
      mockPrisma.academyFolder.create.mockResolvedValue({ id: 'f1', ...dto });
      const result = await service.createFolder(dto as any);
      expect(result.id).toBe('f1');
    });
  });

  describe('getFoldersForLearner', () => {
    it('should return folders for privileged user', async () => {
      mockPrisma.liveClass.findMany.mockResolvedValue([{ id: 'c1' }]);
      mockPrisma.vodPackage.findMany.mockResolvedValue([{ id: 'v1' }]);
      mockPrisma.academyFolder.findMany.mockResolvedValue([
        { id: 'f1', name: 'F1', type: 'GENERAL', _count: { resources: 5 } }
      ]);

      const result = await service.getFoldersForLearner('u1', 'admin');
      expect(result).toHaveLength(1);
      expect(mockPrisma.liveClass.findMany).toHaveBeenCalled();
    });

    it('should return folders for learner based on enrollment', async () => {
      mockPrisma.enrollment.findMany.mockResolvedValue([{ liveClassId: 'c1', vodPackageId: null }]);
      mockPrisma.academyFolder.findMany.mockResolvedValue([
        { id: 'f1', name: 'F1', type: 'GENERAL', _count: { resources: 2 } }
      ]);

      const result = await service.getFoldersForLearner('u1', 'learner');
      expect(result).toHaveLength(1);
      expect(mockPrisma.enrollment.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ userId: 'u1' })
      }));
    });
  });

  describe('createResource', () => {
    it('should create resource and log audit', async () => {
      const dto = { folderId: 'f1', title: 'R1', resourceType: 'FILE' };
      mockPrisma.academyResource.create.mockResolvedValue({ id: 'r1', ...dto });

      const result = await service.createResource(dto as any, 'u1');
      expect(result.id).toBe('r1');
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE_RESOURCE' }));
    });
  });

  describe('getResourcesForLearner', () => {
    it('should throw ForbiddenException if learner is not enrolled', async () => {
      mockPrisma.academyFolder.findUnique.mockResolvedValue({ id: 'f1', liveClassId: 'c1' });
      mockPrisma.enrollment.findFirst.mockResolvedValue(null);

      await expect(service.getResourcesForLearner({ folderId: 'f1', userId: 'u1' })).rejects.toThrow(ForbiddenException);
    });

    it('should return resources with signed URLs for files', async () => {
      mockPrisma.academyFolder.findUnique.mockResolvedValue({ id: 'f1', liveClassId: 'c1' });
      mockPrisma.enrollment.findFirst.mockResolvedValue({ id: 'e1' });
      mockPrisma.academyResource.findMany.mockResolvedValue([
        { id: 'r1', resourceType: 'FILE', fileAssetId: 'a1', visibility: 'PUBLIC' }
      ]);
      mockStorageService.getSignedUrl.mockResolvedValue({ signedUrl: 'https://signed.com' });

      const result = await service.getResourcesForLearner({ folderId: 'f1', userId: 'u1' });
      expect(result[0].downloadUrl).toBe('https://signed.com');
    });
  });

  describe('getResourceDetail', () => {
    it('should throw ForbiddenException for private resource and non-privileged user', async () => {
      mockPrisma.academyResource.findUnique.mockResolvedValue({
        id: 'r1',
        visibility: 'PRIVATE',
        folder: { liveClassId: 'c1' }
      });
      mockPrisma.enrollment.findFirst.mockResolvedValue({ id: 'e1' });

      await expect(service.getResourceDetail('r1', 'u1', 'learner')).rejects.toThrow(ForbiddenException);
    });

    it('should return detail for privileged user even if private', async () => {
      const resource = {
        id: 'r1',
        visibility: 'PRIVATE',
        title: 'Secret',
        folder: { liveClassId: 'c1' },
        fileAsset: { fileUrl: 'public' }
      };
      mockPrisma.academyResource.findUnique.mockResolvedValue(resource);

      const result = await service.getResourceDetail('r1', 'u1', 'admin');
      expect(result.title).toBe('Secret');
    });
  });

  describe('deleteFolder', () => {
    it('should delete folder and log audit', async () => {
      mockPrisma.academyFolder.findUnique.mockResolvedValue({ id: 'f1', name: 'Trash' });
      const result = await service.deleteFolder('f1', 'u1');
      expect(result).toEqual({ ok: true });
      expect(mockPrisma.academyFolder.delete).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE_FOLDER' }));
    });
  });
});
