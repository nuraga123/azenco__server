import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.model';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateJwtToken(user: User) {
    const payload = { user };
    const expiresIn = '4h';
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('SECRET'),
      expiresIn,
    });
  }

  async validateJwtToken(token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>('SECRET'),
    });
    return decoded;
  }
}
