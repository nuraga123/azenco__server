import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  @UseGuards(AuthGuard('local'))
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('context start');
    console.log(context);
    console.log('context end');

    const request = context.switchToHttp().getRequest();
    console.log('request start');
    console.log(request);
    console.log('request end');

    console.log('request.isAuthenticated()');
    console.log(request.isAuthenticated());

    if (request.isAuthenticated()) {
      return true;
    }

    return false;
  }
}
