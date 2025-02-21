import { Body, Controller, Get, Logger, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';
import * as console from 'node:console';
import { ReqParamParseIntPipe } from '../pipes/ReqParamParseIntPipe.pipe';
import { UpdateUsersRolesDto } from './dto/update-users-roles.dto';
import { Response } from 'express';
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageDto } from '../common/message.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get User by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get('/id/:id')
  async getById(@Param('id', ReqParamParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.userService.getById_orThrow(id);
    const userDto = plainToInstance(UserResponseDto, user);

    return userDto;
  }

  @ApiOperation({ summary: 'Get All Users' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @UseGuards(RolesGuard)
  @Get('/get-all')
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return plainToInstance(UserResponseDto, users, { excludeExtraneousValues: true });
  }

  @ApiOperation({ summary: 'Update Users role' })
  @ApiResponse({ status: 200, type: MessageDto })
  @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @UseGuards(RolesGuard)
  @Post('/update-roles')
  async updateRoles(@Body() userDto: UpdateUsersRolesDto) {
    const userTemp = await this.userService.updateRoles(userDto);
    this.logger.log('userTemp ', userTemp);

    // return res.status(200).json({ message: 'Role succesfully updated' });
    // return { message: 'Role succesfully updated' };
    return new MessageDto('Role succesfully updated');
  }

  @ApiOperation({ summary: 'Update User password' })
  @ApiResponse({ status: 200, type: MessageDto })
  @UseGuards(JwtAuthGuard)
  @Post('/update-password')
  async updatePassword(
    @Body() userDto: UpdateUserPasswordDto,
    @Req() req: any,
    // @Res() res: Response,
  ): Promise<MessageDto> {
    const reqUser: UserRequestDto = req.user as UserRequestDto;
    await this.userService.updatePassword(userDto, reqUser.username);
    return new MessageDto('Password succesfully updated!');
  }

  @ApiOperation({ summary: 'Update User email' })
  @ApiResponse({ status: 200, type: MessageDto })
  @UseGuards(JwtAuthGuard)
  @Post('/update-email')
  async updateEmail(@Body() userDto: UpdateUsersEmailDto, @Req() req: any, @Res() res: Response) {
    const reqUser: UserRequestDto = req.user as UserRequestDto;
    await this.userService.updateEmail(userDto, reqUser.username);
    return res.status(200).json({ message: 'Email succesfully updated' });
  }

  @ApiOperation({ summary: 'Create new User' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @UseGuards(RolesGuard)
  @Post('/create')
  async create(@Body() userDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(userDto);

    const userRes = plainToInstance(UserResponseDto, user);
    console.log(userDto);
    return userRes;
  }

  @ApiOperation({ summary: 'Returns items for current page.' })
  @ApiResponse({ status: 200, type: ResponsePageableDto<UserResponseDto> })
  @Roles(RolesEnum.ADMIN, RolesEnum.MANAGER)
  @UseGuards(RolesGuard)
  @Post('/get-page')
  async getPageable(@Body() pageDto: PageDto): Promise<ResponsePageableDto<UserResponseDto>> {
    const responsePageable = new ResponsePageableDto<UserResponseDto>();

    const pageableUsers = await this.userService.getPageable(pageDto);

    responsePageable.items = plainToInstance(UserResponseDto, pageableUsers.items);
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
