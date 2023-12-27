import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    console.log('content start');
    console.log({ ...context });
    console.log('content end');

    const request = context.switchToHttp().getRequest();
    console.log('request.isAuthenticated()');
    console.log(request.isAuthenticated());
    return request.isAuthenticated();
  }
}
