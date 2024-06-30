// token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateJwtToken(user: any) {
    const payload = { user };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('SECRET'),
      expiresIn: '8h',
    });
  }

  async validateJwtToken(token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>('SECRET'),
    });

    return decoded;
  }
}
