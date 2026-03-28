import { Test, TestingModule } from '@nestjs/testing';
import { VodPackageService } from '../src/modules/classroom/vod-package/vod-package.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('VodPackageService', () => {
  let service: VodPackageService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      vodPackage: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ id: 'v1', courseProfile: { status: 'PUBLISHED' } }),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({ id: 'v1' }),
        update: jest.fn().mockResolvedValue({ id: 'v1' }),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VodPackageService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VodPackageService>(VodPackageService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('update', () => {
    it('should throw error if course profile is not PUBLISHED when trying to publish package', async () => {
      prisma.vodPackage.findUnique.mockResolvedValueOnce({
        id: 'v1', courseProfile: { status: 'DRAFT' }
      });
      await expect(service.update('v1', { status: 'PUBLISHED' }))
        .rejects.toThrow('Course Profile) cần được xuất bản');
    });

    it('should update successfully', async () => {
      await service.update('v1', { title: 'New' });
      expect(prisma.vodPackage.update).toHaveBeenCalled();
    });
  });
});
