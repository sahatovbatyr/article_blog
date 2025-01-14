import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Role } from '../../role/entities/role.entity';

export class UserResponseDto {

  @IsString()
  @IsNotEmpty()
  id!: number;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @Exclude()
  password!: string;

  is_active!: boolean;

  roles!: Role[];

}