import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET,
    }),
    ConfigModule,
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
