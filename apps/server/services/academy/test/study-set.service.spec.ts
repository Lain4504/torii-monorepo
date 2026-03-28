import { Test, TestingModule } from '@nestjs/testing';
import { StudySetService } from '../src/modules/study-set/study-set.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { GamificationService } from '../src/modules/gamification/gamification.service';
import { NotFoundException } from '@nestjs/common';

describe('StudySetService', () => {
  let service: StudySetService;
  let prisma: any;
  let gamification: any;

  beforeEach(async () => {
    prisma = {
      studySet: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      setCard: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        delete: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      setCardSrsProgress: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        upsert: jest.fn().mockResolvedValue({ srsState: 'LEARNING', interval: 60, nextReviewAt: new Date() }),
      },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    gamification = {
      trackActivity: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudySetService,
        { provide: PrismaService, useValue: prisma },
        { provide: GamificationService, useValue: gamification },
      ],
    }).compile();

    service = module.get<StudySetService>(StudySetService);
  });

  describe('createSet', () => {
    it('should create a study set', async () => {
      const dto = { title: 'Test Set', description: 'Desc', isPublic: false };
      prisma.studySet.create.mockResolvedValue({ id: 'ss1', ...dto });

      const result = await service.createSet('u1', dto as any);
      expect(result.id).toBe('ss1');
      expect(prisma.studySet.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId: 'u1', sourceType: 'USER' })
      }));
    });
  });

  describe('reviewCard', () => {
    it('should update SRS progress and track gamification', async () => {
      const card = { id: 'c1', studySetId: 'ss1' };
      prisma.setCard.findFirst.mockResolvedValue(card);
      prisma.setCardSrsProgress.findUnique.mockResolvedValue(null);

      await service.reviewCard('c1', 'u1', { quality: 1 });

      expect(prisma.setCardSrsProgress.upsert).toHaveBeenCalled();
      expect(gamification.trackActivity).toHaveBeenCalled();
    });

    it('should throw NotFoundException if card not found', async () => {
      prisma.setCard.findFirst.mockResolvedValue(null);
      await expect(service.reviewCard('invalid', 'u1', { quality: 1 }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getStudyCards', () => {
    it('should return cards due for review', async () => {
      const now = new Date();
      const card1 = { id: 'c1', createdAt: now };
      prisma.studySet.findFirst.mockResolvedValue({ id: 'ss1' });
      prisma.setCard.findMany.mockResolvedValue([card1]);
      prisma.setCardSrsProgress.findMany.mockResolvedValue([
        { setCardId: 'c1', nextReviewAt: new Date(now.getTime() - 10000), srsState: 'LEARNING' }
      ]);

      const result = await service.getStudyCards('ss1', 'u1');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('c1');
    });
  });
});
