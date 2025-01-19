import { Role } from '../../role/entities/role.entity';

export class UserRequestDto {


  constructor(
    private _userId: number,
    private _username: string,
    private _roles: Role[] ) {

  }


  get userId(): number {
    return this._userId;
  }

  set userId(value: number) {
    this._userId = value;
  }

  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  get roles(): Role[] {
    return this._roles;
  }

  set roles(value: Role[]) {
    this._roles = value;
  }
}