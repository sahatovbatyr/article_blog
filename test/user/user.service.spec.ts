import { UserService } from '../../src/user/user.service';
import { User } from '../../src/user/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoleService } from '../../src/role/role.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let roleService: RoleService;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  // const mockUserService = {
  //   getByUsername: jest.fn(),
  // };

  const mockUser = {
    id: 1,
    username: 'Test User',
    email: 'test@test.com',
    roles: [{ id: 1, title: 'Admin' }],
  };

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        RoleService,
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
    roleService = module.get(RoleService);
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
        new NotFoundException('User with id:999 not found.'),
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['roles'],
      });
    });
  });

  describe('getByUsername', () => {

    it('should return user by username', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.getByUsername(mockUser.username);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockUser.username },
        relations: ['roles'],
      });

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by username', async () => {

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await userService.getByUsername('jack');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'jack' },
        relations: ['roles'],
      });

      expect(result).toBeNull();

    });

  });

  describe('getByUsername_orThrow', () => {
    it('should return a user by username or throw an exception if not found', async () => {

      // mocking mothod getByUsername
      userService.getByUsername = jest.fn().mockResolvedValue(mockUser);
      const result = await userService.getByUsername_orThrow(mockUser.username);

      expect(result).toEqual(mockUser);
      expect(userService.getByUsername).toHaveBeenCalledWith(mockUser.username);

      // Mocking method getByUsername to return null
      userService.getByUsername = jest.fn().mockResolvedValue(null);

      await expect(userService.getByUsername_orThrow('NonExistentUser'))
        .rejects.toThrow(NotFoundException);

      expect(userService.getByUsername).toHaveBeenCalledWith('NonExistentUser');

    });
  });

  describe('getByEmail', () => {

    it('should return user by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await userService.getByEmail(mockUser.email);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        relations: ['roles'],
      });
      expect(result).toEqual(mockUser);


    });

    it('should return null if user not exists by email', async () => {

      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await userService.getByEmail(mockUser.email);

      expect(result).toBeNull();
    });

  });

  describe('getByEmail_orThrow', () => {

    it('should throw notFoundexcption if user not found by email', async () => {

      userService.getByEmail = jest.fn().mockResolvedValue(mockUser);
      const result = await userService.getByEmail_orThrow(mockUser.email);

      // user found by email
      expect(userService.getByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUser);

      //user not found
      userService.getByEmail = jest.fn().mockResolvedValue(null);

      await expect(userService.getByEmail_orThrow(mockUser.email)).rejects.toThrow(
        new NotFoundException(`User with email: ${mockUser.email} not found.`),
      );
      expect(userService.getByEmail).toHaveBeenCalledWith(mockUser.email);

    });

  });

  describe('updateRoles', () => {
    it('should update users when roles correctly', async () => {
      const userDto = { id: 1, roleIdList: [1, 2] };
      const userInDb = { id: 1, roles: [] };
      const roles = [{ id: 1 }, { id: 2 }];

      userService.getById_orThrow = jest.fn().mockResolvedValue(userInDb);
      roleService.getRolesByIdList = jest.fn().mockResolvedValue(roles);
      userRepository.save = jest.fn().mockResolvedValue({ ...userInDb, roles });

      const result = await userService.updateRoles(userDto);

      expect(result.roles).toEqual(roles);
      expect(userService.getById_orThrow).toHaveBeenCalledWith(userDto.id);
      expect(roleService.getRolesByIdList).toHaveBeenCalledWith(userDto.roleIdList);
      expect(userRepository.save).toHaveBeenCalledWith(userInDb);
    });

    it('should throw BadRequestException if roleIdList is empty', async () => {
      const userDto = { id: 1, roleIdList: [] };
      await expect(userService.updateRoles(userDto)).rejects.toThrow(
        new BadRequestException('Specify the user\'s roles!'),
      );

    });

    it('should throw BadRequestException if user not found.', async () => {
      const userDto = { id: 1, roleIdList: [1, 2] };

      userService.getById_orThrow = jest.fn().mockRejectedValue(
        new NotFoundException(`User with id:${userDto.id} not found.`),
      );

      await expect(userService.updateRoles(userDto)).rejects.toThrow(
        new NotFoundException(`User with id:${userDto.id} not found.`),
      );
      expect(userService.getById_orThrow).toHaveBeenCalledWith(userDto.id);
    });

    it('should throw BadRequestException if userDto.roles are incorrect ', async () => {
      const userDto = { id: 1, roleIdList: [1, 5] };
      const mockUser = { id: 1, roles: [] };
      const rolesDb = [{ id: 1 }];

      userService.getById_orThrow = jest.fn().mockResolvedValue(mockUser);
      roleService.getRolesByIdList = jest.fn().mockResolvedValue(rolesDb);

      await expect(userService.updateRoles(userDto)).rejects.toThrow(
        new BadRequestException('Incorrect roles.'),
      );

      expect(userService.getById_orThrow).toHaveBeenCalledWith(userDto.id);
      expect(roleService.getRolesByIdList).toHaveBeenCalledWith(userDto.roleIdList);
    });


  });

  describe('updateEmail', () => {

    it('should update email successfully when valid data is provided ', () => {

    });

    it('should throw ForbiddenException if user tries to update another user\'s email', () => {

    });

    it('should throw NotFoundException if user not found ', () => {

    });

    it('should throw BadRequestException if new email is already in use ', () => {

    });

    it('should throw BadRequestException if provided id is invalid ', () => {

    });

    it('should throw ForbiddenException if user tries to update email of another user ', () => {

    });


  });


});