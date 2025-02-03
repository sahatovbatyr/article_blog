import { UserService } from '../../src/user/user.service';
import { User } from '../../src/user/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoleService } from '../../src/role/role.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockRoleService = {
    // someMethod: jest.fn(), // можно не указывать методы, если они не используются
  };

  const mockUser = {
    id: 1,
    username: 'Test User',
    roles: [{ id: 1, title: 'Admin' }],
  };

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: RoleService,
          useValue: {},
        },
      ],
    }).compile();

    userService = module.get(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks(); // Очистка моков после каждого теста
  });

  describe('getById', () => {
    it('should return a user by ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.getById(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['roles'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await userService.getById(999);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['roles'],
      });
      expect(result).toBeNull();
    });
  });

  describe('getById_orThrow', () => {
    it('should return a user by ID if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.getById_orThrow(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['roles'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(userService.getById_orThrow(999)).rejects.toThrow(
        new NotFoundException('User with id:999 not found.')
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['roles'],
      });
    });
  });


});