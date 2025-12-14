import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @MessagePattern({ cmd: 'auth.ping' })
  ping() {
    return this.authServiceService.ping();
  }

  @MessagePattern({ cmd: 'auth.validate-token' })
  validateToken(@Payload() payload: { token?: string }) {
    return this.authServiceService.validateToken(payload.token);
  }
}
