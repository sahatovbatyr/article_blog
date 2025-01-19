import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../role/entities/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor( private reflector: Reflector,
               private jwtService: JwtService ) {
    this.logger.log("The Guard is activate.");
  }


  async canActivate(context: ExecutionContext): Promise<boolean>  {

    try {


      const reqiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass
      ]);

      if ( !reqiredRoles) {
        return true;
      }

      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;

      const bearer = authHeader.split(" ")[0];
      const token = authHeader.split(" ")[1];

      if ( bearer!=="Bearer" || !token) {
        throw new UnauthorizedException("Access Denied. Unauthorized user");
      }

      const payload = await this.jwtService.verifyAsync(token, {secret: "SECRET_KEY"});
      req.user = {id: payload.userId, username: payload.username, roles: payload.roles};

      return req.user.roles.some( (role: Role) => reqiredRoles.includes(role.title) );


    } catch (err ) {

      throw new ForbiddenException("Access DENIED:"+err);

    }

  }


}