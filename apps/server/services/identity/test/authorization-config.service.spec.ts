// @ts-nocheck

import { Test, TestingModule } from '@nestjs/testing';
import {
  AuthorizationConfigService,
  RoleDefinition,
  PermissionDefinition,
} from '../src/modules/authorization/authorization-config.service';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

// Mock fs and js-yaml
jest.mock('fs');
jest.mock('js-yaml');

describe('AuthorizationConfigService', () => {
  let service: AuthorizationConfigService;

  // Define mock data
  const mockRoles: RoleDefinition[] = [
    { code: 'admin', name: 'Admin', description: 'Administrator' },
    { code: 'user', name: 'User', description: 'Regular User' },
  ];

  const mockPermissions: PermissionDefinition[] = [
    { code: 'read:users', description: 'Read users', category: 'users' },
    { code: 'write:users', description: 'Write users', category: 'users' },
  ];

  const mockConfig = {
    system: {
      version: '1.0.0',
      description: 'Test Config',
    },
    roles: mockRoles,
    permissions: mockPermissions,
    default_role_permissions: {
      admin: ['*'],
      user: ['read:users'],
    },
    staff_template_suggestions: {
      manager: ['read:users', 'write:users'],
    },
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock implementations
    (fs.readFileSync as jest.Mock).mockReturnValue('mock-yaml-content');
    (yaml.load as jest.Mock).mockReturnValue(mockConfig);

    // Mock path.join if needed, but the real implementation is usually fine for unit tests unless environment is weird.
    // However, since loadConfig uses path.join(process.cwd(), ...), it might resolve to something we don't control.
    // Since we mock fs.readFileSync, the path actually doesn't matter as long as readFileSync is called.

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationConfigService],
    }).compile();

    service = module.get<AuthorizationConfigService>(
      AuthorizationConfigService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    // Verify config loaded on init
    expect(fs.readFileSync).toHaveBeenCalled();
    expect(yaml.load).toHaveBeenCalledWith('mock-yaml-content');
  });

  describe('getRoles', () => {
    it('should return all roles', () => {
      const roles = service.getRoles();
      expect(roles).toEqual(mockRoles);
    });
  });

  describe('getRoleByCode', () => {
    it('should return role if exists', () => {
      const role = service.getRoleByCode('admin');
      expect(role).toEqual(mockRoles[0]);
    });

    it('should return undefined if role does not exist', () => {
      const role = service.getRoleByCode('non-existent');
      expect(role).toBeUndefined();
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions', () => {
      const permissions = service.getPermissions();
      expect(permissions).toEqual(mockPermissions);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for role', () => {
      const perms = service.getRolePermissions('user');
      expect(perms).toEqual(['read:users']);
    });

    it('should return empty array if role has no specific permissions in config', () => {
      const perms = service.getRolePermissions('unknown');
      expect(perms).toEqual([]);
    });
  });

  describe('getStaffTemplatePermissions', () => {
    it('should return permissions for template', () => {
      const perms = service.getStaffTemplatePermissions('manager');
      expect(perms).toEqual(['read:users', 'write:users']);
    });

    it('should return empty array if template not found', () => {
      const perms = service.getStaffTemplatePermissions('unknown');
      expect(perms).toEqual([]);
    });
  });

  describe('getStaffTemplates', () => {
    it('should return all templates', () => {
      const templates = service.getStaffTemplates();
      expect(templates).toEqual(mockConfig.staff_template_suggestions);
    });
  });

  describe('isValidPermission', () => {
    it('should return true if permission exists', () => {
      expect(service.isValidPermission('read:users')).toBe(true);
    });

    it('should return true for wildcard *', () => {
      expect(service.isValidPermission('*')).toBe(true);
    });

    it('should return false if permission does not exist', () => {
      expect(service.isValidPermission('invalid:perm')).toBe(false);
    });
  });

  describe('isValidRole', () => {
    it('should return true if role exists', () => {
      expect(service.isValidRole('admin')).toBe(true);
    });

    it('should return false if role does not exist', () => {
      expect(service.isValidRole('superadmin')).toBe(false);
    });
  });

  describe('loadConfig error handling', () => {
    it('should throw error if config loading fails', async () => {
      // We need to re-instantiate service to trigger constructor again
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      // Since constructor throws, we can't use Test.createTestingModule like usual directly
      // Or rather, await Test.createTestingModule(...).compile() will fail if provider instantiation fails?
      // Actually, providers are instantiated lazily or eagerly?
      // NestJS instantiates singletons on module init.

      await expect(
        Test.createTestingModule({
          providers: [AuthorizationConfigService],
        }).compile(),
      ).rejects.toThrow('Failed to load authorization configuration');
    });
  });

  describe('reloadConfig', () => {
    it('should reload configuration', () => {
      // Change mock content for reload
      const newConfig = {
        ...mockConfig,
        system: { ...mockConfig.system, version: '2.0.0' },
      };
      (yaml.load as jest.Mock).mockReturnValue(newConfig);

      service.reloadConfig();

      // Access private config property or check side effects?
      // Since config is private, we can verify side effects using public getters.
      // But getRoles relies on config.roles which hasn't changed.
      // Let's rely on calls.
      expect(fs.readFileSync).toHaveBeenCalledTimes(2); // Initial load + reload
      expect(yaml.load).toHaveBeenCalledTimes(2);
    });
  });
});
