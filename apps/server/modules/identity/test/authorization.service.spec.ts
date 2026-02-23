
import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from '../src/modules/authorization/authorization.service';
import { AuthorizationConfigService } from '../src/modules/authorization/authorization-config.service';
import { PrismaService } from '@server/shared';
import { AUDIT_LOG_SERVICE_TOKEN } from '../src/interfaces/services';

describe('AuthorizationService', () => {
    let service: AuthorizationService;
    let prisma: any;
    let configService: any;
    let natsClient: any;

    beforeEach(async () => {
        const mockPrismaService = {
            rolePermission: {
                findMany: jest.fn(),
                deleteMany: jest.fn(),
                createMany: jest.fn(),
                upsert: jest.fn(),
            },
        };

        const mockAuthorizationConfigService = {
            getRoleByCode: jest.fn(),
            isValidPermission: jest.fn(),
            getRoles: jest.fn(),
            getPermissions: jest.fn(),
        };

        const mockAuditLogService = {
            log: jest.fn(),
        };

        const mockNatsClient = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthorizationService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AuthorizationConfigService, useValue: mockAuthorizationConfigService },
                { provide: AUDIT_LOG_SERVICE_TOKEN, useValue: mockAuditLogService },
                { provide: 'NATS_SERVICE', useValue: mockNatsClient },
            ],
        }).compile();

        service = module.get<AuthorizationService>(AuthorizationService);
        prisma = module.get(PrismaService);
        configService = module.get(AuthorizationConfigService);
        natsClient = module.get('NATS_SERVICE');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUserPermissions', () => {
        it('should return wildcard for admin role', async () => {
            const result = await service.getUserPermissions('user-1', 'admin');
            expect(result.permissions).toEqual(['*']);
        });

        it('should return permissions from DB for other roles', async () => {
            const mockPerms = [
                { permissionCode: 'read:users' },
                { permissionCode: 'write:users' },
            ];
            prisma.rolePermission.findMany.mockResolvedValue(mockPerms);

            const result = await service.getUserPermissions('user-1', 'staff');
            expect(result.permissions).toEqual(['read:users', 'write:users']);
            expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
                where: { roleCode: 'staff' },
            });
        });
    });

    describe('hasPermission', () => {
        it('should return true if user has wildcard permission', async () => {
            prisma.rolePermission.findMany.mockResolvedValue([{ permissionCode: '*' }]);
            const result = await service.hasPermission('u1', 'staff', 'any:perm');
            expect(result).toBe(true);
        });

        it('should return true if user has specific permission', async () => {
            prisma.rolePermission.findMany.mockResolvedValue([{ permissionCode: 'read:users' }]);
            const result = await service.hasPermission('u1', 'staff', 'read:users');
            expect(result).toBe(true);
        });

        it('should return false if permission is missing', async () => {
            prisma.rolePermission.findMany.mockResolvedValue([{ permissionCode: 'read:users' }]);
            const result = await service.hasPermission('u1', 'staff', 'write:users');
            expect(result).toBe(false);
        });
    });

    describe('setRolePermissions', () => {
        it('should replace role permissions and emit audit log', async () => {
            const roleCode = 'staff';
            const perms = ['read:users', 'write:users'];
            const context = { actorId: 'admin-1' };

            configService.getRoleByCode.mockReturnValue({ code: 'staff', name: 'Staff' });
            configService.isValidPermission.mockReturnValue(true);
            prisma.rolePermission.findMany.mockResolvedValue([]); // old perms
            prisma.rolePermission.deleteMany.mockResolvedValue({});
            prisma.rolePermission.createMany.mockResolvedValue({});

            await service.setRolePermissions(roleCode, perms, context as any);

            expect(prisma.rolePermission.deleteMany).toHaveBeenCalledWith({ where: { roleCode } });
            expect(prisma.rolePermission.createMany).toHaveBeenCalledWith({
                data: perms.map(p => ({ roleCode, permissionCode: p }))
            });
            expect(natsClient.emit).toHaveBeenCalledWith(
                { cmd: 'identity.audit.log' },
                expect.objectContaining({ action: 'permission.update_role' })
            );
        });

        it('should throw error if role not found', async () => {
            configService.getRoleByCode.mockReturnValue(null);
            await expect(service.setRolePermissions('invalid', [], {} as any))
                .rejects.toThrow('Role invalid not found');
        });
    });

    describe('addPermissionToRole', () => {
        it('should upsert individual permission', async () => {
            configService.getRoleByCode.mockReturnValue({});
            configService.isValidPermission.mockReturnValue(true);
            prisma.rolePermission.upsert.mockResolvedValue({});

            await service.addPermissionToRole('staff', 'new:perm');

            expect(prisma.rolePermission.upsert).toHaveBeenCalledWith(expect.objectContaining({
                create: { roleCode: 'staff', permissionCode: 'new:perm' }
            }));
        });
    });

    describe('getAvailableRoles', () => {
        it('should return mapped roles from config', () => {
            const mockRoles = [{ code: 'admin', name: 'Admin', description: 'desc' }];
            configService.getRoles.mockReturnValue(mockRoles);

            const result = service.getAvailableRoles();
            expect(result).toEqual(mockRoles);
        });
    });
});
