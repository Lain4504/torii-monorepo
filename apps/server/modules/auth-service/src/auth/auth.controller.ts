import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authServiceService: AuthService) { }

  @MessagePattern({ cmd: 'auth.ping' })
  ping() {
    return this.authServiceService.ping();
  }

  @MessagePattern({ cmd: 'auth.signup' })
  signUp(@Payload() payload: any) {
    return this.authServiceService.signUp(payload);
  }

  @MessagePattern({ cmd: 'auth.signin' })
  signIn(@Payload() payload: any) {
    return this.authServiceService.signIn(payload);
  }

  @MessagePattern({ cmd: 'auth.signout' })
  signOut() {
    return this.authServiceService.signOut();
  }

  @MessagePattern({ cmd: 'auth.token-generate' })
  generateToken(
    @Payload()
    payload: {
      roomName: string;
      participantName: string;
      identity: string;
    },
  ) {
    return this.authServiceService.createToken(payload);
  }

  @MessagePattern({ cmd: 'file.getClientFiles' })
  getClientFiles(@Payload() data: any) {
    return this.authServiceService.getClientFiles(data);
  }
}

