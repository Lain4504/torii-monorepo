import { Controller, Get, Query } from '@nestjs/common';

import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('/health/auth')
  pingAuth() {
    return this.gatewayService.pingAuth();
  }

  @Get('/auth/validate')
  validate(@Query('token') token?: string) {
    return this.gatewayService.validateToken(token);
  }
}
