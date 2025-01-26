import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Role } from '../role/entities/role.entity';
import { EnvKeys } from '../enums/EnvKeys';

export const DatabaseConfig = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService)=> ({
    type: 'postgres',
    host: configService.get(EnvKeys.DB_HOST || "localhost") ,
    port: Number( configService.get(EnvKeys.DB_PORT )) ,
    username: configService.get(EnvKeys.DB_USER) || "postgres",
    password: configService.get(EnvKeys.DB_PASSWORD) || "postgres",
    database: String( configService.get(EnvKeys.DB_NAME)),
    entities: [ User, Role  ],
    synchronize: true,

  })


});