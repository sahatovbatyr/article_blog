import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/user/user.service';
import { RoleService } from '../../src/role/role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/user/user.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUsersEmailDto } from '../../src/user/dto/UpdateUsersEmailDto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let roleService: RoleService;

  const mockUser = {
    id: 1,
    username: 'Test User',
    email: 'test@test.com',
    roles: [{ id: 1, title: 'Admin' }],
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockRoleService = {
    getById: jest.fn(),
    getByTitle: jest.fn(),
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
          useValue: mockRoleService,
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
      expect(roleService.getRolesByIdList).toHaveBeenCalledWith(
        userDto.roleIdList,
      );
      expect(userRepository.save).toHaveBeenCalledWith(userInDb);
    });

    it('should throw BadRequestException if roleIdList is empty', async () => {
      const userDto = { id: 1, roleIdList: [] };
      await expect(userService.updateRoles(userDto)).rejects.toThrow(
        new BadRequestException("Specify the user's roles!"),
      );
    });

    it('should throw BadRequestException if user not found.', async () => {
      const userDto = { id: 1, roleIdList: [1, 2] };

      userService.getById_orThrow = jest
        .fn()
        .mockRejectedValue(
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
      expect(roleService.getRolesByIdList).toHaveBeenCalledWith(
        userDto.roleIdList,
      );
    });
  });

  describe('updateEmail', () => {
    const userDto = new UpdateUsersEmailDto();
    userDto.username = mockUser.username;
    userDto.email = 'new@test.com';
    let author = '';

    it('should update email successfully when valid data is provided ', async () => {
      author = mockUser.username;
      const email = userDto.email;

      userService.getByUsername_orThrow = jest.fn().mockResolvedValue(mockUser);
      userService.getByEmail = jest.fn().mockResolvedValue(null);
      userRepository.save = jest.fn().mockResolvedValue({ ...mockUser, email });

      const result = await userService.updateEmail(userDto, author);

      expect(result.email).toEqual(userDto.email);
      expect(userService.getByUsername_orThrow).toHaveBeenCalledWith(
        userDto.username,
      );
      expect(userService.getByEmail).toHaveBeenCalledWith(userDto.email);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it("should throw ForbiddenException if user tries to update another user's email", async () => {
      author = 'user_2';
      await expect(userService.updateEmail(userDto, author)).rejects.toThrow(
        new ForbiddenException(
          'Access Denied. The email can be changed only by the owner.',
        ),
      );
    });

    it('should throw NotFoundException if user not found ', async () => {
      author = userDto.username;
      userService.getByUsername_orThrow = jest
        .fn()
        .mockRejectedValue(
          new NotFoundException(`User ${userDto.username} not found.`),
        );

      await expect(userService.updateEmail(userDto, author)).rejects.toThrow(
        new NotFoundException(`User ${userDto.username} not found.`),
      );
      expect(userService.getByUsername_orThrow).toHaveBeenCalledWith(
        userDto.username,
      );
    });

    it('should throw BadRequestException if new email is already in use ', async () => {
      userService.getByUsername_orThrow = jest.fn().mockResolvedValue(mockUser);
      userService.getByEmail = jest.fn().mockResolvedValue(mockUser);

      await expect(
        userService.updateEmail(userDto, userDto.username),
      ).rejects.toThrow(
        new BadRequestException(`Email ${userDto.email} already exists.`),
      );
      expect(userService.getByUsername_orThrow).toHaveBeenCalledWith(
        userDto.username,
      );
      expect(userService.getByEmail).toHaveBeenCalledWith(userDto.email);
    });
  });
});
