import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOne({ where: { username } });

    if (!user) return { error_message: 'İstifadəçi tapılmadı' };

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) return { error_message: 'Yanlış istifadəçi parolu' };

    if (user && passwordValid) {
      const token = await this.tokenService.generateJwtToken(user);
      return {
        userId: user.id,
        username: user.username,
        email: user.email,
        token,
      };
    }
  }
}
