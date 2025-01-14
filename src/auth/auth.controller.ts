import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginUserDto } from '../user/dto/LoginUserDto';
import { CreateUserDto } from '../user/dto/user.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post("/login")
  async login( @Body() userDto: LoginUserDto) {

    return this.authService.login(userDto)

  }

  @Post("/registration")
  async registration( @Body() userDto: CreateUserDto) {

    return this.authService.registration(userDto);

  }


}
