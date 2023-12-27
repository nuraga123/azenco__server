import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthenticatedGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext): boolean {
    // Вызываем родительский метод canActivate для выполнения стандартной логики
    const canActivate = super.canActivate(context);

    if (canActivate) {
      // Дополнительная логика проверки аутентификации, если необходимо
      const authenticateOptions = super.getAuthenticateOptions(context);

      if (authenticateOptions) {
        // Дополнительная логика проверки опций аутентификации, если необходимо
        return true;
      }
    }

    return false;
  }
}
