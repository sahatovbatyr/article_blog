import { IsNotEmpty, IsNumber, IsString } from 'class-validator';


export class RoleDto {

  @IsNumber()
  @IsNotEmpty()
  id!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;
}