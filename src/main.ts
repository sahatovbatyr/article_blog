import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ConfigService } from '@nestjs/config';
import * as console from 'node:console';
import * as process from 'node:process';
import { AppEnvInterface, EnvKeys } from './config/app.env';
import { BadRequestException, } from '@nestjs/common';
import { ValidationException } from './exceptions/validation.exception';
import { ValidationPipe } from './pipes/validation.pipe';




async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService<AppEnvInterface>> (ConfigService);
  const host_port = configService.get<number>(EnvKeys.HOST_PORT)  ?? 3000;

  const  validationPipe =  new ValidationPipe();


  app.useGlobalPipes( validationPipe );


  await app.listen(host_port, () => console.log(`Server started on ${host_port}`));
}
void bootstrap();
