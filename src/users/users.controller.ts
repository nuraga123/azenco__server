import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  Header,
  Request as NestRequest,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express'; // добавим импорт express Request

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LocalAuthGuard } from 'src/auth/local.auth.guard';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import {
  LoginCheckResponse,
  LoginUserRequest,
  LoginUserResponse,
  LogoutUserResponse,
  SignupResponse,
} from './types';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({ type: SignupResponse })
  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  @Header('Content-type', 'application/json')
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log('Creating user:', createUserDto);
    return this.usersService.create(createUserDto);
  }

  @ApiBody({ type: LoginUserRequest })
  @ApiOkResponse({ type: LoginUserResponse })
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  login(@NestRequest() req: ExpressRequest) {
    console.log('User logged in:', req.user);
    return { user: req.user, msg: 'Logged in' };
  }

  @ApiOkResponse({ type: LoginCheckResponse })
  @Get('/check')
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.OK)
  loginCheck(@NestRequest() req: ExpressRequest) {
    console.log('Checking user:', req?.user);
    if (req) {
      return req.user;
    } else {
      return { ...req, myMessage: false };
    }
  }

  @ApiOkResponse({ type: LogoutUserResponse })
  @Get('/logout')
  logout(@Request() req) {
    req.session.destroy();
    return { msg: 'Session has ended' };
  }
}
