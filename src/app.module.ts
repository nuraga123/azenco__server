import { SequelizeModule } from '@nestjs/sequelize';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { SequelizeConfigService } from './config/sequelizeConfig.service';
import { databaseConfig } from './config/configuration';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { TokenModule } from './token/token.module';
import { OrderModule } from './order/order.module';
import { HistoryModule } from './history/history.module';
import { CarsModule } from './cars/cars.module';
import { ErrorsModule } from './errors/errors.module';
import { BarnModule } from './barn/module/barn.module';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useClass: SequelizeConfigService,
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET'),
        signOptions: { expiresIn: '1y' },
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
    BarnModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    TokenModule,
    OrderModule,
    HistoryModule,
    CarsModule,
    ErrorsModule,
  ],
})
export class AppModule {}
