import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule, ConfigModule],
  providers: [TokenService, JwtService, ConfigService],
  exports: [TokenService],
})
export class TokenModule {}
