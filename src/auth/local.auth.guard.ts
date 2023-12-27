import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();

    await super.logIn(request);

    if (request.isAuthenticated()) {
      // Пользователь успешно аутентифицирован
      console.log('User is authenticated:', request.user);
      return result;
    } else {
      // Пользователь не аутентифицирован
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
