import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { appEnv } from '../../src/config/app.env';
import process from 'node:process';
import { UserModule } from '../../src/user/user.module';
import { User } from '../../src/user/user.entity';
import { CreateUserDto } from '../../src/user/dto/user.dto';
import * as request from 'supertest';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../../src/user/dto/UserResponseDto';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

// Mock data
const mockUser = {
  id: 1,
  username: 'TestUser',
  roles: [{ id: 1, title: 'Admin' }],
};

const mockUserService = {
  getById: jest.fn(),
  getById_orThrow: jest.fn(),
  getByUsername: jest.fn(),
  create: jest.fn(),
  getAll: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};


describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        RolesGuard,
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    userController = module.get(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('getById', () => {
    it('should return a user when found', async () => {
      mockUserService.getById_orThrow.mockResolvedValue(mockUser);

      const result = await userController.getById(1);

      expect(userService.getById_orThrow).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 999;
      mockUserService.getById_orThrow
        .mockRejectedValue(new NotFoundException(`User with id:${userId} not found.`));


      await expect(userController.getById(userId)).rejects.toThrow(NotFoundException);
      expect(userService.getById_orThrow).toHaveBeenCalledWith(userId);


    });
  });


});