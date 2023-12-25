import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  isAuthenticated(): boolean;
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    console.log(request);
    return request.isAuthenticated();
  }
}
