
import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationSeederService } from '@server/identity/modules/authorization/authorization-seeder.service';
import { PrismaService } from '@server/shared';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

// Mock fs and js-yaml
jest.mock('fs');
jest.mock('js-yaml');

describe('AuthorizationSeederService', () => {
    let service: AuthorizationSeederService;
    let prisma: any;

    // Mock config data
    const mockConfig = {
        system: { version: '1.0', description: 'Test' },
        roles: [{ code: 'admin', name: 'Admin', description: 'Admin' }],
        permissions: [{ code: 'read:users', description: 'Read users', category: 'users' }],
        default_role_permissions: {
            admin: ['read:users', '*'],
        },
    };

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock file reading
        (fs.readFileSync as jest.Mock).mockReturnValue('yaml-content');
        (yaml.load as jest.Mock).mockReturnValue(mockConfig);

        // Mock Prisma
        const mockPrismaService = {
            rolePermission: {
                count: jest.fn(),
                create: jest.fn(),
                findUnique: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthorizationSeederService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<AuthorizationSeederService>(AuthorizationSeederService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should call seedIfNeeded and syncPermissionsFromConfig', async () => {
            const seedSpy = jest.spyOn(service, 'seedIfNeeded').mockResolvedValue();
            const syncSpy = jest.spyOn(service, 'syncPermissionsFromConfig').mockResolvedValue();

            await service.onModuleInit();

            expect(seedSpy).toHaveBeenCalled();
            expect(syncSpy).toHaveBeenCalled();
        });
    });

    describe('seedIfNeeded', () => {
        it('should skip seeding if permissions already exist', async () => {
            prisma.rolePermission.count.mockResolvedValue(10);

            await service.seedIfNeeded();

            expect(prisma.rolePermission.count).toHaveBeenCalled();
            expect(prisma.rolePermission.create).not.toHaveBeenCalled();
        });

        it('should seed data if no permissions exist', async () => {
            prisma.rolePermission.count.mockResolvedValue(0);
            prisma.rolePermission.create.mockResolvedValue({});

            await service.seedIfNeeded();

            expect(fs.readFileSync).toHaveBeenCalled();
            expect(yaml.load).toHaveBeenCalled();

            // Should create permissions for admin (read:users and *)
            expect(prisma.rolePermission.create).toHaveBeenCalledTimes(2);
            expect(prisma.rolePermission.create).toHaveBeenCalledWith({
                data: { roleCode: 'admin', permissionCode: 'read:users' }
            });
            expect(prisma.rolePermission.create).toHaveBeenCalledWith({
                data: { roleCode: 'admin', permissionCode: '*' }
            });
        });

        it('should handle errors during seeding', async () => {
            prisma.rolePermission.count.mockRejectedValue(new Error('DB Error'));
            await expect(service.seedIfNeeded()).rejects.toThrow('DB Error');
        });
    });

    describe('syncPermissionsFromConfig', () => {
        it('should add missing permissions', async () => {
            // Mock missing permissions
            prisma.rolePermission.findUnique.mockResolvedValue(null);
            prisma.rolePermission.create.mockResolvedValue({});

            await service.syncPermissionsFromConfig();

            // Should attempt to find and create duplicate calls are expected in loop logic but effectively
            // we want to ensure it tries to create missing ones
            expect(prisma.rolePermission.findUnique).toHaveBeenCalledTimes(2); // Two perms in mockConifg
            expect(prisma.rolePermission.create).toHaveBeenCalledTimes(2);
        });

        it('should skip existing permissions', async () => {
            // Mock existing permissions
            prisma.rolePermission.findUnique.mockResolvedValue({ id: 'existing' });

            await service.syncPermissionsFromConfig();

            expect(prisma.rolePermission.findUnique).toHaveBeenCalledTimes(2);
            expect(prisma.rolePermission.create).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            prisma.rolePermission.findUnique.mockRejectedValue(new Error('Sync Error'));
            // Does not throw, just logs error
            await service.syncPermissionsFromConfig();
            // Expect no unhandled rejection
        });
    });

    describe('reseedNewPermissions', () => {
        it('should call syncPermissionsFromConfig', async () => {
            const syncSpy = jest.spyOn(service, 'syncPermissionsFromConfig').mockResolvedValue();
            await service.reseedNewPermissions();
            expect(syncSpy).toHaveBeenCalled();
        });
    });
});
