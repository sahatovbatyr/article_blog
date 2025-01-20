import {
  Body,
  Controller,
  Get, Logger,
  Param,
  Post, Req, Res, UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';
import * as console from 'node:console';
import { ReqParamParseIntPipe } from '../pipes/ReqParamParseIntPipe.pipe';
import { UpdateUsersRolesDto } from './dto/update-users-roles.dto';
import { Response, Request } from 'express';
import { UpdateUserPasswordDto } from './dto/UpdateUserPassword.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PageDto, ResponsePageableDto } from './dto/UserPageDto';
import { UserResponseDto } from './dto/UserResponseDto';
import { Roles } from '../decorators/roles.decorator';
import { RolesEnum } from '../enums/RolesEnum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRequestDto } from './dto/UserRequestDto';
import { UpdateUsersEmailDto } from './dto/UpdateUsersEmailDto';

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

  @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @UseGuards(RolesGuard)
  @Get("/get-all")
   async findAll(): Promise<User[]> {

    return await this.userService.findAll();
  }

  @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @UseGuards(RolesGuard)
  @Post("/update-roles")
   async updateRoles(@Body( ) userDto: UpdateUsersRolesDto, @Res() res: Response  )  {
    const userTemp = await  this.userService.updateRoles(userDto);
    this.logger.log("userTemp ", userTemp);

    return res.status(200).json({message: "Role succesfully updated"});
  }

  @UseGuards(JwtAuthGuard)
  @Post("/update-password")
  async updatePassword(@Body( ) userDto: UpdateUserPasswordDto, @Req() req: any, @Res() res: Response  )  {
    // this.logger.log("req.user:", JSON.stringify(req.user) );

    const reqUser: UserRequestDto =  req.user as UserRequestDto;
     await  this.userService.updatePassword(userDto, reqUser.username);
    return res.status(200).json({message: "Password succesfully updated"});
  }

  @UseGuards(JwtAuthGuard)
  @Post("/update-email")
  async updateEmail(@Body( ) userDto: UpdateUsersEmailDto, @Req() req: any, @Res() res: Response  )  {

    const reqUser: UserRequestDto =  req.user as UserRequestDto;
    await  this.userService.updateEmail(userDto, reqUser.username);
    return res.status(200).json({message: "Email succesfully updated"});
  }


  @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @UseGuards(RolesGuard)
  @Post("/create")
   async create( @Body( ) userDto: CreateUserDto): Promise<UserResponseDto>  {

    const user = await this.userService.create(userDto);

    const userRes = plainToInstance(UserResponseDto, user);
    console.log(userDto);
    return userRes;
  }

  @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @UseGuards(RolesGuard)
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
