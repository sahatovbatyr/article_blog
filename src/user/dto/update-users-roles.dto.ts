import { IsArray, IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsersRolesDto {
  @ApiProperty({ example: '1', description: 'User id' })
  @IsNumber()
  @IsNotEmpty()
  readonly id!: number;

  @ApiProperty({ example: '[ 1, 2, 3]', description: 'Role id List' })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  readonly roleIdList!: number[];
}
