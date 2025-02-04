import { UserService } from '../../src/user/user.service';
import { User } from '../../src/user/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoleService } from '../../src/role/role.service';
import exp = require('node:constants');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

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

  describe("getByUsername", ()=> {

    it('should return user by username', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.getByUsername(mockUser.username);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {username: mockUser.username},
        relations: ["roles"]
      });

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by username', async () => {

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await userService.getByUsername("jack");

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username:"jack"},
        relations: ["roles"]
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

    it('should return user by email', async () =>  {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await userService.getByEmail(mockUser.email);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {email: mockUser.email},
        relations:["roles"]
      });
      expect(result).toEqual(mockUser);


    });

    it('should return null if user not exists by email', async () => {

      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await userService.getByEmail(mockUser.email);

      expect(result).toBeNull();
    });

  });

  describe("getByEmail_orThrow", () => {

    it('should throw notFoundexcption if user not found by email', async () => {

      userService.getByEmail = jest.fn().mockResolvedValue(mockUser);
      const result = await userService.getByEmail_orThrow(mockUser.email);

      // user found by email
      expect( userService.getByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUser);

      //user not found
      userService.getByEmail = jest.fn().mockResolvedValue(null);

      await expect(userService.getByEmail_orThrow(mockUser.email)).rejects.toThrow(
        new NotFoundException(`User with email: ${mockUser.email} not found.`)
      );
      expect(userService.getByEmail).toHaveBeenCalledWith(mockUser.email);

    });


  });


});