import { RoleDto } from '../../role/dto/role.dto';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export class UpdateUsersRolesDto {

  @IsNumber()
  @IsNotEmpty()
  readonly id!: number;

  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  readonly roleIdList!: number[];
}