import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginUserDto } from '../user/dto/LoginUserDto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from  "bcrypt";
import { User } from '../user/user.entity';
import { Payload } from './entities/Payload';
import { CreateUserDto } from '../user/dto/user.dto';

@Injectable()
export class AuthService {

  constructor( private userService: UserService,
               private jwtService: JwtService) {
  }


  async login( userDto: LoginUserDto) {

    const user = await this.verifyUser( userDto);
    return  this.generateToken(user);

  }

  async registration( userDto: CreateUserDto)  {

    const candidate = await this.userService.getByUsername_FullData_noException(userDto.username);

    if (candidate) {
       throw new BadRequestException(`Username: ${userDto.username} already exists.`)
    }

    const user = await this.userService.create(userDto);
    return this.generateToken(user);

  }



  private async generateToken(user: User) {

    const token = this.jwtService.sign({userId: user.id, username: user.username, roles: user.roles } );

    return { token: token };

  }

  private async verifyUser(userDto: LoginUserDto): Promise<User> {

    const user = await this.userService.getByUsername_FullData(userDto.username);
    const isValid = await bcrypt.compare(  userDto.password, user.password  );

    if ( !user || !isValid ) {
      throw new UnauthorizedException("Error. User or password not match.")
    }

    return user;

  }


}
