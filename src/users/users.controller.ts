import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LocalAuthGuard } from '../auth/local.auth.guard';

import {
  LoginCheckResponse,
  LoginUserRequest,
  LoginUserResponse,
  LogoutUserResponse,
  SignupResponse,
} from './types';

import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { TokenService } from 'src/token/token.service';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  private readonly startTime: number;
  private readonly startDateTime: Date;

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {
    this.startDateTime = new Date();
    this.startTime = this.startDateTime.getTime();
  }

  @Get('/names')
  async getUsersNames() {
    return this.usersService.findUsersNames();
  }

  @Get('/work')
  @HttpCode(HttpStatus.OK)
  @Header('Content-type', 'application/json')
  getWorking() {
    return true;
  }

  @Get('/time')
  @HttpCode(HttpStatus.OK)
  getServerStartTime(): { startTime: string; elapsedTime: number } {
    const currentTime = new Date();
    const elapsedTimeInSeconds = Math.floor(
      (currentTime.getTime() - this.startTime) / 1000,
    );
    return {
      startTime: this.startDateTime.toString(),
      elapsedTime: elapsedTimeInSeconds,
    };
  }

  @ApiOkResponse({ type: SignupResponse })
  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  @Header('Content-type', 'application/json')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBody({ type: LoginUserRequest })
  @ApiOkResponse({ type: LoginUserResponse })
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  login(@Request() req) {
    return { user: req.user, msg: 'Logged in' };
  }

  @ApiOkResponse({ type: LoginCheckResponse })
  @Get('/login-check')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  loginCheck(@Request() req) {
    console.log(req);
    return req.user;
  }

  @Get(':id')
  getUserOne(@Param('id') id: string) {
    const usersData = this.usersService.findUserOne(+id);
    console.log(usersData);
    return usersData;
  }

  @Get('remove/:id')
  removeUser(@Param('id') id: number) {
    return this.usersService.removeUserById(+id);
  }

  @ApiOkResponse({ type: LogoutUserResponse })
  @Get('/logout')
  logout(@Request() req) {
    req.session.destroy();
    return { msg: 'session has ended' };
  }

  @Post('/secret-word')
  resetPassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.usersService.updateUserPassword(updatePasswordDto);
  }
  @Post('/secret')
  getSecret(@Body() { secret }: { secret: string }) {
    return this.usersService.getDoneSecret(secret);
  }

  @Post('validate-token')
  async validateToken(@Body() { token }: { token: string }) {
    try {
      console.log(`token ${token}`);
      const validation = await this.tokenService.validateJwtToken(token);
      console.log(`validation`);
      console.log(validation);
      return {
        id: validation.user.id,
        username: validation.user.username,
        email: validation.user.email,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
