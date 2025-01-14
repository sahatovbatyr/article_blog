import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { appEnv }  from "./config/app.env";
import * as process from 'node:process';
import { LoggingMiddleware } from './middleware/loggin.middleware';
import { APP_PIPE } from '@nestjs/core';
import {  ReqParamParseIntPipe } from './pipes/ReqParamParseIntPipe.pipe';
import { RoleModule } from './role/role.module';
import { DatabaseConfig } from './config/database-config';
import { AuthModule } from './auth/auth.module';



@Module({
  imports: [
    // DatabaseModule,

    DatabaseConfig,

    ConfigModule.forRoot({
      isGlobal:true,
      load: [ appEnv ],
      envFilePath: [`.${process.env.NODE_ENV}.env`],
    }),

    UserModule,
    RoleModule,
    AuthModule,


  ],
  controllers: [AppController],
  providers: [
    AppService
    // {
    //   provide: APP_PIPE,
    //   useClass: ValidationPipe,
    // },
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }

}
