
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthService } from '../src/modules/auth/google-auth.service';
import { AppConfigService } from '@server/shared';
import { OAuth2Client } from 'google-auth-library';
import { UnauthorizedException, Logger } from '@nestjs/common';

// Mock google-auth-library
jest.mock('google-auth-library');

describe('GoogleAuthService', () => {
    let service: GoogleAuthService;
    let mockOAuthClient: any;

    const mockAppConfigService = {
        thirdParty: {
            google: {
                clientId: 'mock-google-client-id',
                clientSecret: 'mock-google-client-secret',
            },
        },
    };

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup OAuth2Client mock implementation
        mockOAuthClient = {
            verifyIdToken: jest.fn(),
        };
        (OAuth2Client as unknown as jest.Mock).mockImplementation(() => mockOAuthClient);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GoogleAuthService,
                {
                    provide: AppConfigService,
                    useValue: mockAppConfigService,
                },
            ],
        }).compile();

        service = module.get<GoogleAuthService>(GoogleAuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(OAuth2Client).toHaveBeenCalledWith('mock-google-client-id');
    });

    describe('verifyIdToken', () => {
        const idToken = 'valid-google-id-token';
        const mockPayload = {
            sub: 'google-user-id',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/photo.jpg',
            email_verified: true,
            given_name: 'Test',
            family_name: 'User',
        };

        it('should successfully verify a valid token and return user info', async () => {
            // Mock verifyIdToken to resolve with a ticket having the payload
            mockOAuthClient.verifyIdToken.mockResolvedValue({
                getPayload: () => mockPayload,
            });

            const result = await service.verifyIdToken(idToken);

            expect(mockOAuthClient.verifyIdToken).toHaveBeenCalledWith({
                idToken,
                audience: 'mock-google-client-id',
            });

            expect(result).toEqual({
                sub: mockPayload.sub,
                name: mockPayload.name,
                email: mockPayload.email,
                picture: mockPayload.picture,
                email_verified: mockPayload.email_verified,
                given_name: mockPayload.given_name,
                family_name: mockPayload.family_name,
            });
        });

        it('should use email as name if name is missing', async () => {
            const payloadWithoutName = { ...mockPayload, name: undefined };
            mockOAuthClient.verifyIdToken.mockResolvedValue({
                getPayload: () => payloadWithoutName,
            });

            const result = await service.verifyIdToken(idToken);

            expect(result.name).toBe(mockPayload.email);
        });

        it('should throw UnauthorizedException if verifyIdToken fails', async () => {
            mockOAuthClient.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

            await expect(service.verifyIdToken(idToken)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if payload is missing', async () => {
            mockOAuthClient.verifyIdToken.mockResolvedValue({
                getPayload: () => null,
            });

            await expect(service.verifyIdToken(idToken)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if required fields (sub, email) are missing', async () => {
            mockOAuthClient.verifyIdToken.mockResolvedValue({
                getPayload: () => ({ name: 'User' }), // Missing sub and email
            });

            await expect(service.verifyIdToken(idToken)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('isConfigured', () => {
        it('should return true when clientId is configured', () => {
            expect(service.isConfigured()).toBe(true);
        });

        it('should return false when clientId is missing', async () => {
            // Re-create module with missing config
            const incompleteConfig = {
                thirdParty: {
                    google: {
                        clientId: '',
                    },
                },
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    GoogleAuthService,
                    {
                        provide: AppConfigService,
                        useValue: incompleteConfig,
                    },
                ],
            }).compile();

            const incompleteService = module.get<GoogleAuthService>(GoogleAuthService);
            expect(incompleteService.isConfigured()).toBe(false);
        });
    });

    describe('constructor logging', () => {
        it('should warn if clientId is missing', async () => {
            const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

            const incompleteConfig = {
                thirdParty: {
                    google: {
                        clientId: '',
                    },
                },
            };

            await Test.createTestingModule({
                providers: [
                    GoogleAuthService,
                    {
                        provide: AppConfigService,
                        useValue: incompleteConfig,
                    },
                ],
            }).compile();

            expect(loggerSpy).toHaveBeenCalledWith('Google Client ID not configured. Google OAuth will not work.');
        });
    });

});
