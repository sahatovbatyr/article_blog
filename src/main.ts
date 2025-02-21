import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ConfigService } from '@nestjs/config';
import * as console from 'node:console';
import { ValidationPipe } from './pipes/validation.pipe';
import { AppEnvInterface } from './config/AppEnvInterface';
import { EnvKeys } from './enums/EnvKeys';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService<AppEnvInterface>>(ConfigService);
  const host_port = configService.get<number>(EnvKeys.HOST_PORT) ?? 3000;

  const validationPipe = new ValidationPipe();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/doc', app, documentFactory);

  app.useGlobalPipes(validationPipe);

  await app.listen(host_port, () =>
    console.log(`Server started on ${host_port}`),
  );
}

void bootstrap();
