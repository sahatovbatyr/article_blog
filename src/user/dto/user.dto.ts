import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50, { message: 'No less 3 and great 50' })
  @ApiProperty({ example: 'my_username', description: 'Username' })
  username!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'my_password', description: 'Password' })
  password!: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ example: 'my_email@email.com', description: 'Users email' })
  email!: string;
}
