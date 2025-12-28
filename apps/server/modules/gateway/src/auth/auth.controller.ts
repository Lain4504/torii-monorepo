import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { UserRegistrationDTO, UserLoginDTO, UserUpdateDTO, ReqWithRequester } from '@workspace/schemas';
import { RemoteAuthGuard } from '@server/shared';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  // ================== Authentication Routes ==================

  @Post('register')
  async register(@Body() dto: UserRegistrationDTO) {
    return firstValueFrom(this.natsClient.send({ cmd: 'auth.signup' }, dto));
  }

  @Post('login')
  async login(@Body() dto: UserLoginDTO) {
    return firstValueFrom(this.natsClient.send({ cmd: 'auth.signin' }, dto));
  }

  @Post('logout')
  @UseGuards(RemoteAuthGuard)
  async logout() {
    return firstValueFrom(this.natsClient.send({ cmd: 'auth.signout' }, {}));
  }

  // ================== User Profile Routes ==================

  @Get('profile')
  @UseGuards(RemoteAuthGuard)
  async getProfile(@Request() req: ReqWithRequester) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'user.profile' }, req.requester.sub)
    );
  }

  @Patch('profile')
  @UseGuards(RemoteAuthGuard)
  async updateProfile(@Request() req: ReqWithRequester, @Body() dto: UserUpdateDTO) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'users.update' }, {
        id: req.requester.sub,
        requester: req.requester,
        ...dto,
      })
    );
  }

  @Delete('profile')
  @UseGuards(RemoteAuthGuard)
  async deleteProfile(@Request() req: ReqWithRequester) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'users.delete' }, {
        id: req.requester.sub,
        requester: req.requester,
      })
    );
  }
}

