import {
  Body,
  Controller,
  Get, Logger,
  Param,
  ParseIntPipe,
  Post, Res, UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';
import * as console from 'node:console';
import { ReqParamParseIntPipe } from '../pipes/ReqParamParseIntPipe.pipe';
import { UpdateUsersRolesDto } from './dto/update-users-roles.dto';
import { Response } from 'express';
import { UpdateUserPasswordDto } from './dto/UpdateUserPassword.dto';
import { LoginUserDto } from './dto/LoginUserDto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PageDto, ResponsePageableDto } from './dto/UserPageDto';
import { UserResponseDto } from './dto/UserResponseDto';

@Controller('/user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get("/id/:id")
   async getById(@Param("id", ReqParamParseIntPipe ) id: number): Promise<UserResponseDto> {

    const user =  await this.userService.getById(id);
    const userDto = plainToInstance(UserResponseDto, user );

    return userDto;
  }

  @Get("/get-all")
   async findAll(): Promise<User[]> {

    return await this.userService.findAll();
  }

  @Post("/update-roles")
   async updateRoles(@Body( ) userDto: UpdateUsersRolesDto, @Res() res: Response  )  {
    const userTemp = await  this.userService.updateRoles(userDto);
    this.logger.log("userTemp ", userTemp);

    return res.status(200).json({message: "Role succesfully updated"});
  }

  @Post("/update-password")
  async updatePassword(@Body( ) userDto: UpdateUserPasswordDto, @Res() res: Response  )  {
     await  this.userService.updatePassword(userDto);
    return res.status(200).json({message: "Password succesfully updated"});
  }


  @Post("/create")
   async create( @Body( ) userDto: CreateUserDto): Promise<UserResponseDto>  {

    const user = await this.userService.create(userDto);

    const userRes = plainToInstance(UserResponseDto, user);
    console.log(userDto);
    return userRes;
  }

  @Post("/get-page")
  async getPageable( @Body() pageDto: PageDto): Promise< ResponsePageableDto<UserResponseDto> > {

    let responsePageable = new ResponsePageableDto<UserResponseDto>();

    const pageableUsers = await this.userService.getPageable(pageDto);

    responsePageable.items = plainToInstance(UserResponseDto, pageableUsers.items );
    responsePageable.limit = pageableUsers.limit;
    responsePageable.total = pageableUsers.total;
    responsePageable.page = pageableUsers.page;
    responsePageable.totalPages = pageableUsers.totalPages;

    return responsePageable;


  }

  // @Post("/login")
  // async verify( @Body( ) userDto: LoginUserDto): Promise<UserResponseDto> {
  //   const user = await  this.userService.login(userDto);
  //   const res = plainToInstance(UserResponseDto, user);
  //     return res;
  //   // return res.status(200).json({message: "Login success."})
  //
  // }


}
