import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  @UseGuards(AuthGuard('local'))
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.isAuthenticated()) {
      return true;
    }

    return true;
  }
}
