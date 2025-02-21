import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Role } from '../../role/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1', description: 'User id ' })
  id!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'username', description: 'Username' })
  username!: string;

  @Exclude()
  password!: string;

  is_active!: boolean;

  @ApiProperty({ type: () => Role, isArray: true, description: 'User Role' })
  roles!: Role[];
}
