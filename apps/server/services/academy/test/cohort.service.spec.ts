import { Test, TestingModule } from '@nestjs/testing';
import { CohortService } from '../src/modules/classroom/cohort/cohort.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';

describe('CohortService', () => {
  let service: CohortService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      cohort: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ id: 'c1' }),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({ id: 'c1' }),
        update: jest.fn().mockResolvedValue({ id: 'c1' }),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CohortService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CohortService>(CohortService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should handle onlyAvailable filter', async () => {
      await service.findAll({ onlyAvailable: true });
      expect(prisma.cohort.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ 
          where: expect.objectContaining({ 
            AND: expect.arrayContaining([
              expect.objectContaining({ OR: expect.any(Array) })
            ]) 
          }) 
        })
      );
    });
  });

  describe('create', () => {
    it('should create cohort with dates', async () => {
      const data = { 
        courseProfileId: 'cp1', 
        code: 'CO1', 
        name: 'N', 
        price: 100, 
        enrollmentOpenAt: '2026-01-01' 
      };
      await service.create(data as any);
      expect(prisma.cohort.create).toHaveBeenCalledWith(
        expect.objectContaining({ 
          data: expect.objectContaining({ 
            enrollmentOpenAt: expect.any(Date) 
          }) 
        })
      );
    });
  });
});
