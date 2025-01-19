import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginUserDto } from '../user/dto/LoginUserDto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { Payload } from './entities/Payload';
import { CreateUserDto } from '../user/dto/user.dto';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor( private userService: UserService,
               private jwtService: JwtService) {
  }


  async login( userDto: LoginUserDto) {

    const user = await this.verifyUser( userDto);
    return  this.generateToken(user);

  }

  async registration( userDto: CreateUserDto)  {

    const candidate = await this.userService.getByUsername(userDto.username);

    if (candidate) {
       throw new BadRequestException(`Username: ${userDto.username} already exists.`)
    }

    const user = await this.userService.create(userDto);

    return await this.generateToken(user);

  }



  private async generateToken(user: User) {

    const token = this.jwtService.sign({userId: user.id, username: user.username, roles: user.roles } );

    return { token: token };

  }

  private async verifyUser(userDto: LoginUserDto): Promise<User> {

    const user = await this.userService.getByUsername_orThrow(userDto.username);
    this.logger.log("user:", JSON.stringify(user));

    const isValid =await this.userService.comparePassword(  userDto.password, user.password  );

    if ( !user || !isValid ) {
      throw new UnauthorizedException("Error. User or password not match.")
    }

    return user;

  }


}
