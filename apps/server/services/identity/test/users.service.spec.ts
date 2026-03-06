import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/modules/users/users.service';
import { USERS_REPOSITORY_TOKEN } from '../src/interfaces/repositories';
import { AUTHORIZATION_SERVICE_TOKEN } from '../src/interfaces/services';
import { AppConfigService, REDIS_CLIENT } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserRole } from '@workspace/schemas';

// Mock argon2
jest.mock('argon2');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: any;
  let authorizationService: any;
  let mapper: any;
  let natsClient: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    role: UserRole.LEARNER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequester = {
    sub: 'user-123',
    email: 'test@example.com',
    role: UserRole.LEARNER,
    permissions: [],
  };

  beforeEach(async () => {
    const mockUsersRepository = {
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      emailExists: jest.fn(),
      create: jest.fn(),
      getUserBasicInfo: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockAuthorizationService = {
      getUserPermissions: jest.fn(),
    };

    const mockRedis = {
      set: jest.fn(),
    };

    const mockMapper = {
      map: jest.fn(),
    };

    const mockNatsClient = {
      emit: jest.fn(),
    };

    const mockAppConfigService = {
      identity: {
        webAdminUrl: 'http://admin.test',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY_TOKEN, useValue: mockUsersRepository },
        {
          provide: AUTHORIZATION_SERVICE_TOKEN,
          useValue: mockAuthorizationService,
        },
        { provide: REDIS_CLIENT, useValue: mockRedis },
        { provide: getMapperToken(), useValue: mockMapper },
        { provide: 'NATS_SERVICE', useValue: mockNatsClient },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(USERS_REPOSITORY_TOKEN);
    authorizationService = module.get(AUTHORIZATION_SERVICE_TOKEN);
    mapper = module.get(getMapperToken());
    natsClient = module.get('NATS_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const options = { page: 1, limit: 10 };
      usersRepository.findMany.mockResolvedValue([mockUser]);
      usersRepository.count.mockResolvedValue(1);
      mapper.map.mockReturnValue({ ...mockUser });

      const result = await service.findAll(options);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(usersRepository.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      mapper.map.mockReturnValue({ ...mockUser });

      const result = await service.findById(mockUser.id);
      expect(result.id).toBe(mockUser.id);
    });

    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findById.mockResolvedValue(null);
      await expect(service.findById('404')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = { email: 'new@test.com', displayName: 'New' };
      usersRepository.emailExists.mockResolvedValue(false);
      usersRepository.create.mockResolvedValue({
        ...mockUser,
        email: dto.email,
      });
      mapper.map.mockReturnValue({ ...mockUser, email: dto.email });

      const result = await service.create(dto);
      expect(result.email).toBe(dto.email);
      expect(usersRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email exists', async () => {
      usersRepository.emailExists.mockResolvedValue(true);
      await expect(
        service.create({ email: 'exists@test.com', displayName: 'Ex' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserWithPermissions', () => {
    it('should return user with aggregated permissions', async () => {
      usersRepository.getUserBasicInfo.mockResolvedValue(mockUser);
      authorizationService.getUserPermissions.mockResolvedValue({
        permissions: ['read:all'],
      });

      const result = await service.getUserWithPermissions(mockUser.id);

      expect(result.permissions).toEqual(['read:all']);
      expect(result.id).toBe(mockUser.id);
    });
  });

  describe('update', () => {
    it('should allow user to update themselves', async () => {
      const dto = { displayName: 'Updated Name' };
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.update.mockResolvedValue({ ...mockUser, ...dto });
      mapper.map.mockReturnValue({ ...mockUser, ...dto });

      const result = await service.update(
        mockRequester as any,
        mockUser.id,
        dto,
      );

      expect(result.displayName).toBe(dto.displayName);
      expect(usersRepository.update).toHaveBeenCalled();
      expect(natsClient.emit).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user tries to update another user without perms', async () => {
      const otherRequester = {
        ...mockRequester,
        sub: 'other-id',
        permissions: [],
      };
      await expect(
        service.update(otherRequester as any, mockUser.id, {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.softDelete.mockResolvedValue({});

      const result = await service.delete(mockRequester as any, mockUser.id);

      expect(result.message).toContain('soft deleted');
      expect(usersRepository.softDelete).toHaveBeenCalledWith(mockUser.id);
      expect(natsClient.emit).toHaveBeenCalledWith(
        { cmd: 'identity.audit.log' },
        expect.objectContaining({ action: 'user.delete' }),
      );
    });

    it('should hard delete user if requested', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.delete.mockResolvedValue({});

      const result = await service.delete(
        mockRequester as any,
        mockUser.id,
        true,
      );

      expect(result.message).toContain('permanently deleted');
      expect(usersRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
