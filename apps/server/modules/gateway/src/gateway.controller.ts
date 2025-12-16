import { Controller, Get, Query, Post, Req, Header, HttpCode, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiKeyGuard } from '@server/shared/guards/api-key.guard';
import { BypassTransform } from '@server/shared';

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

  @Post('api/verifyToken')
  @BypassTransform()
  async verifyToken(@Req() req: any, @Res() res: Response) {
    const authHeader = req.headers['authorization'] || '';
    // raw body is guaranteed by main.ts middleware for application/protobuf
    // but we safety check
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const result = await this.gatewayService.verifyPnmToken(authHeader, body);
    res.setHeader('Content-Type', 'application/protobuf');
    res.status(200).send(Buffer.from(result));
  }
}
