import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, ValidateIf } from 'class-validator';


export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  @Length( 3, 50, {  message: "No less 3 and great 50"} )
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;


  @IsEmail()
  @IsOptional()
  email!:string;

}






