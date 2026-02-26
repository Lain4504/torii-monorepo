
import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '../src/modules/auth/session.service';
import { PrismaService, JwtTokenProvider } from '@server/shared';

describe('SessionService', () => {
    let service: SessionService;
    let prisma: any;
    let jwtProvider: any;

    const mockSession = {
        id: 'session-123',
        userId: 'user-123',
        tokenHash: 'hashed-token',
        expiresAt: new Date(Date.now() + 10000),
        revokedAt: null,
    };

    beforeEach(async () => {
        const mockPrismaService = {
            session: {
                create: jest.fn().mockResolvedValue({}),
                findUnique: jest.fn(),
                updateMany: jest.fn().mockResolvedValue({ count: 0 }),
                deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
                findMany: jest.fn().mockResolvedValue([]),
                update: jest.fn().mockResolvedValue({}),
            },
        };

        const mockJwtProvider = {
            generateRefreshToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtTokenProvider, useValue: mockJwtProvider },
            ],
        }).compile();

        service = module.get<SessionService>(SessionService);
        prisma = module.get(PrismaService);
        jwtProvider = module.get(JwtTokenProvider);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createSession', () => {
        it('should create a session successfully', async () => {
            const userId = 'user-123';
            const refreshToken = 'signed-jwt';

            jwtProvider.generateRefreshToken.mockResolvedValue(refreshToken);

            const result = await service.createSession(userId);

            expect(result.refreshToken).toBe(refreshToken);
            expect(result.sessionId).toBeDefined();
            expect(prisma.session.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userId,
                    tokenHash: expect.any(String),
                }),
            }));
        });
    });

    describe('verifySession', () => {
        it('should verify and return payload for valid session', async () => {
            const token = 'valid-token';
            const payload = { sub: 'user-123', sid: 'session-123' };
            const hashedToken = service.hashTokenPublic(token);

            jwtProvider.verifyRefreshToken.mockResolvedValue(payload);
            prisma.session.findUnique.mockResolvedValue({
                ...mockSession,
                tokenHash: hashedToken,
            });

            const result = await service.verifySession(token);

            expect(result).toEqual(payload);
        });

        it('should detect replay attack and revoke session if hashes do not match', async () => {
            const token = 'replay-token';
            const payload = { sub: 'user-123', sid: 'session-123' };

            jwtProvider.verifyRefreshToken.mockResolvedValue(payload);
            prisma.session.findUnique.mockResolvedValue({
                ...mockSession,
                tokenHash: 'different-hash',
            });

            const revokeSpy = jest.spyOn(service, 'revokeSessionById').mockResolvedValue();

            const result = await service.verifySession(token);

            expect(result).toBeNull();
            expect(revokeSpy).toHaveBeenCalledWith(mockSession.id, mockSession.userId);
        });
    });

    describe('revokeSession', () => {
        it('should revoke session by token hash', async () => {
            const hash = 'some-hash';
            await service.revokeSession(hash);
            expect(prisma.session.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { tokenHash: hash, revokedAt: null }
            }));
        });
    });

    describe('revokeAllUserSessions', () => {
        it('should revoke all sessions for a user', async () => {
            const userId = 'user-123';
            await service.revokeAllUserSessions(userId);
            expect(prisma.session.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId, revokedAt: null }
            }));
        });
    });

    describe('cleanupExpiredSessions', () => {
        it('should call deleteMany for cleanup', async () => {
            prisma.session.deleteMany.mockResolvedValue({ count: 5 });
            const result = await service.cleanupExpiredSessions();
            expect(result).toBe(5);
            expect(prisma.session.deleteMany).toHaveBeenCalled();
        });
    });
});
