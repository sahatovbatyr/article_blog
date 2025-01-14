import { IsNotEmpty, IsNumber, IsString } from 'class-validator';


export class UpdateUserPasswordDto {

  @IsString()
  @IsNotEmpty()
  readonly username!: string;

  @IsNotEmpty()
  @IsString()
  readonly oldPassword!:string;

  @IsNotEmpty()
  @IsString()
  readonly newPassword!: string;

  @IsNotEmpty()
  @IsString()
  readonly newPasswordConfirmation!: string;

}