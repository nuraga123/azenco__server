import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controller';
import { User } from './users.model';
import { UsersService } from './users.service';
import { TokenService } from 'src/token/token.service';
import { TokenModule } from 'src/token/token.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [SequelizeModule.forFeature([User]), TokenModule],
  controllers: [UsersController],
  providers: [UsersService, TokenService, JwtService, ConfigService],
  exports: [UsersService, TokenService, JwtService],
})
export class UsersModule {}
