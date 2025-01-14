import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUsersRolesDto } from './dto/update-users-roles.dto';
import { Role } from '../role/entities/role.entity';
import { RoleService } from '../role/role.service';
import { UpdateUserPasswordDto } from './dto/UpdateUserPassword.dto';
import * as bcrypt from "bcrypt";
import { PageDto, ResponsePageableDto } from './dto/UserPageDto';

@Injectable()
export class UserService {

  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly roleService: RoleService
  ) {}

  async getById(id: number): Promise<User> {
    const userRec = await this.userRepository.findOne({
      where:{id},
      relations: ["roles"]
    });

    if ( !userRec) {
      throw new NotFoundException(`User with id:${id} not found.`);
    }

    return userRec;

  }

  async getById_FullData(id: number): Promise<User> {
    const userRec = await this.userRepository.findOne({
      where:{id},
      relations: ["roles"]
    });

    if ( !userRec) {
      throw new NotFoundException(`User with id:${id} not found.`);
    }
    return userRec;

  }

  async getByUsername_FullData(username: string): Promise<User> {
    const userRec = await this.getByUsername_FullData_noException(username);

    if ( !userRec) {
      throw new NotFoundException(`User ${username} not found.`);
    }
    return userRec;

  }

  async getByUsername_FullData_noException(username: string): Promise<User | null> {
    const userRec = await this.userRepository.findOne({
      where:{username},
      relations: ["roles"]
    });

    return userRec;

  }



  async updateRoles(   userDto: Readonly<UpdateUsersRolesDto>): Promise<User> {
    const user = await this.getById_FullData(userDto.id);

    const roles = await this.roleService.getRolesByIdList(userDto.roleIdList);

    if (  roles.length != userDto.roleIdList.length ) {
      throw new BadRequestException("Incorrect roles.");
    }

    user.roles = roles;
      const res = await this.userRepository.save(user);
      this.logger.log(` User id:${userDto.id} roles updated`);

    return res;

  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async create(userDto: CreateUserDto): Promise<User> {

    const user = await this.userRepository.findOneBy({username: userDto.username});

    if ( user ) {
      throw new BadRequestException(`Error. Username: ${userDto.username} already exists.`);
    }

    const role = await this.roleService.findByTitle("USER");

    const userRec = await this.userRepository.create(userDto);
    userRec.password = await bcrypt.hash(userDto.password, 10);
    userRec.roles =[role];


    const savedUser = await this.userRepository.save(userRec);
    this.logger.log(`User ${savedUser.username} created.`);

    return savedUser;
  }

  async updatePassword( userDto: UpdateUserPasswordDto ) {

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
    this.userRepository.save(user);
    this.logger.log(`User: ${user.username} password changed.`);
    return;

  }

  async getPageable( userPageDto: PageDto) : Promise<ResponsePageableDto<User>> {
    const { page=1, limit = 20 } = userPageDto;
    const skip = (page-1)*limit;




    let [items, total ]:[ User[], number] = [[], 0];

    if ( userPageDto.text) {
      const words = userPageDto.text.split(" ").map( word => word.trim()).filter(Boolean);
      this.logger.log("words:", words);
      [items, total ] = await this.userRepository.findAndCount({
       where:  words.map( word =>  ({ username: ILike(`%${word}%`)}) ),
        skip,
        take: limit,
        relations: ["roles"]
      });
      this.logger.log("items:", items);
    } else {
      [items, total ] = await this.userRepository.findAndCount({
        skip,
        take: limit,
        relations: ["roles"]
      });
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