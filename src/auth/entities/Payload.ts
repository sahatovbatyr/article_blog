import { Role } from '../../role/entities/role.entity';
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';


export class Payload {

  constructor(   userId: number, username: string,  roles: Role[] ) {
    this.roles = roles;
    this.username = username;
    this.userId;
  }

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsInt()
  @IsNotEmpty()
  userId!: number;


  @IsNotEmpty()
  roles!: Role[];
}