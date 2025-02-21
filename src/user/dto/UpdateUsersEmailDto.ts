import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsersEmailDto {
  @ApiProperty({ example: 'my_username', description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'my_email@example.com', description: 'User email' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
