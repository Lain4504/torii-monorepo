import { PrismaService } from '@server/shared/prisma/prisma.service';

export async function ensureDefaultPlacementExam(prisma: PrismaService) {
  const existing = await prisma.exam.findFirst({
    where: { examType: 'PLACEMENT' },
  });

  if (existing) return existing;

  const exam = await prisma.exam.create({
    data: {
      title: 'Default JLPT Placement Test',
      description:
        'Configurable placement assessment to determine JLPT level based on vocabulary, grammar and reading.',
      examType: 'PLACEMENT',
      level: null,
      totalTimeLimitMinutes: 30,
      status: 'DRAFT',
      settings: {
        maxAttemptsPerUser: 3,
        retakePolicy: 'after_days',
        retakeAfterDays: 7,
        minAnsweredToSubmit: 5,
        placementScoring: {
          levelThresholds: [
            { level: 'N5', minPercentage: 0 },
            { level: 'N4', minPercentage: 55 },
            { level: 'N3', minPercentage: 60 },
            { level: 'N2', minPercentage: 58 },
            { level: 'N1', minPercentage: 55 },
          ],
          assessedLevelRule: 'highest_passed',
          categoryWeights: { vocabulary: 1, grammar: 1, reading: 1.2 },
        },
      },
    },
  });

  return exam;
}

