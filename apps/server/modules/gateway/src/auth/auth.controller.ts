import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Post('register')
  async register(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'auth.signup' }, body));
  }

  @Post('login')
  async login(@Body() body: any) {
    return firstValueFrom(this.natsClient.send({ cmd: 'auth.signin' }, body));
  }

  @Post('logout')
  async logout() {
    return firstValueFrom(this.natsClient.send({ cmd: 'auth.signout' }, {}));
  }
}

