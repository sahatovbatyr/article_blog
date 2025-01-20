import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, ValidateIf } from 'class-validator';


export class LoginUserDto {

  @ValidateIf( object=> !object.email)
  @IsString()
  @IsOptional()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @ValidateIf( object => !object.username)
  @IsEmail()
  @IsOptional()
  email!:string;

}