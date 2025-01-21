import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUsersEmailDto {

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!:string;
}