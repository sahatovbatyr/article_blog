import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
      secret: "SECRET_KEY",
      signOptions: {
        expiresIn: '60m'
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [ AuthService ]
})
export class AuthModule {}
