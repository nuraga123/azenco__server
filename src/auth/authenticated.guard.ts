import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as passport from 'passport';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      await new Promise<void>((resolve, reject) => {
        passport.authenticate('local', (err: any, user: any, info: any) => {
          if (err) {
            console.log(info);
            reject(err);
          }
          if (!user) {
            reject(new Error('Authentication failed'));
          }
          request.login(user, (err: any) => {
            if (err) {
              reject(err);
            }
            resolve();
          });
        })(request, null, resolve);
      });

      // После повторной проверки, request.user должен быть определен
      console.log({
        user: request.user,
      });
    }

    return request.isAuthenticated();
  }
}
