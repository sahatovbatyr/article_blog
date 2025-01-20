import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {  Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUsersRolesDto } from './dto/update-users-roles.dto';
import { RoleService } from '../role/role.service';
import { UpdateUserPasswordDto } from './dto/UpdateUserPassword.dto';
import * as bcrypt from "bcrypt";
import { PageDto, ResponsePageableDto } from './dto/UserPageDto';
import { UpdateUsersEmailDto } from './dto/UpdateUsersEmailDto';

@Injectable()
export class UserService {

  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly roleService: RoleService
  ) {}

  async getById(id: number): Promise<User | null> {
    const userRec = await this.userRepository.findOne({
      where:{id},
      relations: ["roles"]
    });

    return userRec;

  }

  async getById_orThrow(id: number): Promise<User> {
    const userRec = await this.userRepository.findOne({
      where:{id},
      relations: ["roles"]
    });

    if ( !userRec) {
      throw new NotFoundException(`User with id:${id} not found.`);
    }

    return userRec;

  }

  async getByUsername(username: string): Promise<User | null> {
    const userRec = await this.userRepository.findOne({
      where:{username},
      relations: ["roles"]
    });

    return userRec;

  }

  async getByUsername_orThrow(username: string): Promise<User> {
    const userRec = await this.getByUsername(username);

    if ( !userRec) {
      throw new NotFoundException(`User ${username} not found.`);
    }
    return userRec;

  }

  async getByEmail(email: string): Promise<User | null> {
    const userRec = await this.userRepository.findOne({
      where:{email},
      relations: ["roles"]
    });

    return userRec;

  }

  async getByEmail_orThrow(email: string): Promise<User> {
    const userRec = await this.userRepository.findOne({
      where:{email},
      relations: ["roles"]
    });

    if ( !userRec) {
      throw new NotFoundException(`User with email: ${email} not found.`);
    }
    return userRec;

  }



  async updateRoles(   userDto: Readonly<UpdateUsersRolesDto>): Promise<User> {

    if ( userDto.roleIdList.length == 0) {
      throw new BadRequestException("Specify the user's roles!");
    }

    const user = await this.getById_orThrow(userDto.id);
    const roles = await this.roleService.getRolesByIdList(userDto.roleIdList);

    if (  roles.length != userDto.roleIdList.length ) {
      throw new BadRequestException("Incorrect roles.");
    }

    user.roles = roles;
      const res = await this.userRepository.save(user);
      this.logger.log(` User id:${userDto.id} roles updated`);

    return res;

  }

  async updateEmail(   userDto: Readonly<UpdateUsersEmailDto>, author:string): Promise<User> {

    if ( author !== userDto.username) {
      throw new ForbiddenException("Access Denied. The email can be changed only by the owner.");
    }

    const user = await this.getByUsername_orThrow(userDto.username);
    user.email = userDto.email;
    const res = await this.userRepository.save(user);
    return res;

  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async comparePassword(unhashedPassword: string, hashedPassword:string) {
    return await bcrypt.compare(  unhashedPassword, hashedPassword );
  }

  async create(userDto: CreateUserDto): Promise<User> {

    const user = await this.userRepository.findOneBy({username: userDto.username});

    if ( user ) {
      throw new BadRequestException(`Error. Username: ${userDto.username} already exists.`);
    }

    if ( userDto.email) {
      const userByEmail  = await this.userRepository.findOneBy({email: userDto.email});
      if ( userByEmail )  {
        throw new BadRequestException(`Error. Email: ${userDto.email} already exists.`)
      }
    }

    const role = await this.roleService.findByTitle("USER");

    const userRec = await this.userRepository.create(userDto);
    userRec.password = await bcrypt.hash(userDto.password, 10);
    userRec.roles =[role];


    const savedUser = await this.userRepository.save(userRec);
    this.logger.log(`User ${savedUser.username} created.`);

    return savedUser;
  }

  async updatePassword( userDto: UpdateUserPasswordDto, author: string ) {

    if ( author !== userDto.username) {
      throw new ForbiddenException("Access Denied. The password can be changed only by the owner.");
    }
    this.logger.log(`trying updatePassword() for user: ${userDto.username}`);

    if ( userDto.newPassword != userDto.newPasswordConfirmation ) {
      throw new BadRequestException("new Password and confirmation not match.");
    }

    const hashedOldPassword = await bcrypt.hash(userDto.oldPassword, 10);

    const user = await this.userRepository.findOne({
      where: { username: userDto.username }
    });

    if ( !user ) {
      throw new NotFoundException("Username or password are wrong not match.");
    }

    const isPasswordValid = await bcrypt.compare(hashedOldPassword, user.password);

    if ( isPasswordValid ) {
      throw new NotFoundException("Username or password are wrong not match.");
    }

    user.password = await bcrypt.hash(userDto.newPassword, 10);
    await this.userRepository.save(user);
    this.logger.log(`User: ${user.username} password changed.`);
    return;

  }

  async getPageable( userPageDto: PageDto) : Promise<ResponsePageableDto<User>> {
    const { page=1, limit = 20 } = userPageDto;
    const skip = (page-1)*limit;

    let [items, total ]:[ User[], number] = [[], 0];

    if ( userPageDto.text) {
      const words = userPageDto.text.split(" ").map( word => word.trim()).filter(Boolean);

      const queryBuilder = this.userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.roles", "role");

      words.forEach( (word, index) =>  {
        queryBuilder.andWhere(`user.username LIKE :word${index}`, {
          [`word${index}`]: `%${word}%`
        } )
      } );

      items = await queryBuilder
        .skip(skip)
        .take(limit)
        .getMany();

      total = await queryBuilder.getCount();

    } else {

      [items, total] = await this.userRepository.findAndCount({
        skip:skip,
        take: limit,
        relations: ["roles"]
      })


    }

    const responsePageableDto = new ResponsePageableDto<User>();

    responsePageableDto.page = page;
    responsePageableDto.items = items;
    responsePageableDto.total = total;
    responsePageableDto.limit = limit;
    responsePageableDto.totalPages = Math.ceil(total / limit);

    return responsePageableDto;


  }

  // async verify( userDto: LoginUserDto) : Promise<User> {
  //
  //   const user = await this.getByUsername_FullData(userDto.username);
  //   const isValid = await bcrypt.compare(  userDto.password, user.password  );
  //
  //   if ( !user || !isValid ) {
  //     throw new NotFoundException("Error. User or password not match.")
  //   }
  //
  //   return user;
  //
  // }



}