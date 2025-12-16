import { Controller, Get, Query, Post, Req, Header, RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) { }

  @Get('/health/auth')
  pingAuth() {
    return this.gatewayService.pingAuth();
  }

  @Get('/auth/validate')
  validate(@Query('token') token?: string) {
    return this.gatewayService.validateToken(token);
  }

  @Post('/verifyToken')
  @Header('Content-Type', 'application/protobuf')
  async verifyToken(@Req() req: any) {
    const authHeader = req.headers['authorization'] || '';
    // raw body is guaranteed by main.ts middleware for application/protobuf
    // but we safety check
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const result = await this.gatewayService.verifyPnmToken(authHeader, body);
    return Buffer.from(result);
  }
}
