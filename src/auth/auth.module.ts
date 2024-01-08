import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { TokenService } from 'src/token/token.service';
import { TokenModule } from 'src/token/token.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
    TokenModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer,
    TokenService,
    JwtService,
    ConfigService,
  ],
})
export class AuthModule {}
