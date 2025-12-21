import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { GatewayService } from './gateway.service';
import { ClientProxy } from "@nestjs/microservices";

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Get('/health/auth')
  pingAuth() {
    return this.gatewayService.pingAuth();
  }

  @Get('healthCheck')
  healthCheck() {
    return { status: 'success', msg: 'System is up' };
  }

  @Post('api/verifyToken')
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
