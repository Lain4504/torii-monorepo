import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) { }

  @Post('register')
  async register(@Body() body: any) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.signup' }, body));
  }

  @Post('login')
  async login(@Body() body: any) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.signin' }, body));
  }

  @Post('logout')
  async logout() {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.signout' }, {}));
  }

  @Post('getClientFiles')
  async getClientFiles(@Body() body: any) {
    return firstValueFrom(this.authClient.send({ cmd: 'file.getClientFiles' }, body));
  }
}

