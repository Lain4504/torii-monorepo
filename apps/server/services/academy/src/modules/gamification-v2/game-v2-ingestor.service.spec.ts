import { GameV2IngestorService } from './game-v2-ingestor.service';

describe('GameV2IngestorService (idempotency)', () => {
  it('should not double-create ledger entries for the same sourceRef', async () => {
    const userId = '00000000-0000-0000-0000-000000000001';

    let ledgerFindFirstCalls = 0;
    let streakTodayExists = false;

    const gameLedgerCreate = jest.fn().mockResolvedValue({ id: 'ledger-1' });
    const gameStreakCreate = jest.fn().mockResolvedValue({ id: 'streak-1' });

    const txMock = {
      gameProfile: {
        upsert: jest.fn().mockResolvedValue({ userId } as any),
        findUnique: jest.fn().mockResolvedValue({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          freezeCount: 0,
          totalActiveDays: 0,
          totalXp: 0,
          currentXp: 0,
          points: 0,
          level: 1,
        } as any),
        update: jest.fn().mockResolvedValue({} as any),
      },
      gameLedgerEntry: {
        findFirst: jest.fn().mockImplementation(() => {
          const res = ledgerFindFirstCalls === 0 ? null : { id: 'ledger-existing' };
          ledgerFindFirstCalls++;
          return Promise.resolve(res as any);
        }),
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
        create: gameLedgerCreate,
      },
      gameStreakLog: {
        findFirst: jest.fn().mockImplementation(({ where }: any) => {
          // existingToday lookup includes `date`
          if (where?.date) return Promise.resolve(streakTodayExists ? { id: 'today' } : null);
          // lastActive lookup
          return Promise.resolve(null);
        }),
        create: jest.fn().mockImplementation(async (args: any) => {
          streakTodayExists = true;
          return gameStreakCreate(args);
        }),
      },
    } as any;

    const prismaMock = {
      $transaction: jest.fn().mockImplementation(async (cb: any) => cb(txMock)),
    } as any;

    const service = new GameV2IngestorService(prismaMock);

    const meta = { reviewId: '00000000-0000-0000-0000-000000000010' };
    const eventTime = new Date().toISOString();

    await service.ingestActivity({ userId, activityType: 'REVIEW', meta, eventTime });
    await service.ingestActivity({ userId, activityType: 'REVIEW', meta, eventTime });

    // First ingest creates 2 ledger entries: POINT and XP.
    expect(gameLedgerCreate).toHaveBeenCalledTimes(2);
  });
});

