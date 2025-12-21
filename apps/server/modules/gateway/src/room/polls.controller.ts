import { Body, Controller, Get, Inject, Logger, Param, Post, Req, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type {
  ActivatePollsReq,
  CreatePollReq,
  SubmitPollResponseReq,
  ClosePollReq,
} from '@workspace/protocol';
import { ActivatePollsReqSchema, ClosePollReqSchema, CreatePollReqSchema, SubmitPollResponseReqSchema, PollResponseSchema } from '@workspace/protocol';
import { fromBinary, toBinary, create } from '@bufbuild/protobuf';
import type { Response } from 'express';

@Controller('api/polls')
@UseGuards(JwtAuthGuard)  // Apply JWT authentication to all endpoints
export class PollsController {
  private readonly logger = new Logger(PollsController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  private sendProto(res: Response, payload: any) {
    const message = create(PollResponseSchema, payload as any);
    const buffer = toBinary(PollResponseSchema, message);
    res.setHeader('Content-Type', 'application/protobuf');
    res.status(200).send(Buffer.from(buffer));
  }

  private decodeProto<T>(body: any, schema: any): T {
    try {
      if (Buffer.isBuffer(body)) {
        try {
          return fromBinary(schema, body) as T;
        } catch (err) {
          // Fallback: try JSON parse for JSON clients that were buffered
          try {
            const parsedJson = JSON.parse(body.toString('utf8'));
            return parsedJson as T;
          } catch { /* ignore */ }
          throw err;
        }
      }
      // Handle objects like { type: 'Buffer', data: [...] }
      if (body && typeof body === 'object' && body.type === 'Buffer' && Array.isArray(body.data)) {
        try {
          return fromBinary(schema, Buffer.from(body.data)) as T;
        } catch {
          try {
            return JSON.parse(Buffer.from(body.data).toString('utf8')) as T;
          } catch { /* ignore */ }
        }
      }
      // Handle plain array of numbers
      if (Array.isArray(body) && body.every((v) => typeof v === 'number')) {
        try {
          return fromBinary(schema, Buffer.from(body)) as T;
        } catch {
          try {
            return JSON.parse(Buffer.from(body).toString('utf8')) as T;
          } catch { /* ignore */ }
        }
      }
      if (body instanceof Uint8Array) {
        try {
          return fromBinary(schema, Buffer.from(body)) as T;
        } catch {
          try {
            return JSON.parse(Buffer.from(body).toString('utf8')) as T;
          } catch { /* ignore */ }
        }
      }
      if (typeof body === 'string') {
        // try base64 first, then utf8 raw
        try {
          const b64 = Buffer.from(body, 'base64');
          if (b64.length > 0) return fromBinary(schema, b64) as T;
        } catch { /* ignore */ }
        try {
          const utf8 = Buffer.from(body, 'utf8');
          if (utf8.length > 0) return fromBinary(schema, utf8) as T;
        } catch { /* ignore */ }
        try {
          return JSON.parse(body) as T;
        } catch { /* ignore */ }
      }
    } catch (err) {
      // fall through
    }
    return body as T;
  }

  private decodeFromReq<T>(req: any, fallbackBody: any, schema: any): T {
    const raw = req?.body ?? req?.rawBody;
    if (raw && Buffer.isBuffer(raw) && raw.length > 0) {
      try {
        return fromBinary(schema, raw) as T;
      } catch { /* fall back */ }
    }
    return this.decodeProto<T>(fallbackBody ?? raw, schema);
  }

  private getAuthContext(req: any) {
    const user = req.user || {};
    const roomId = user.room_id || user.room || user.video?.room;
    const userId = user.user_id || user.userId || user.sub;
    const isAdmin = user.is_admin ?? user.isAdmin ?? user.metadata?.is_admin ?? user.metadata?.isAdmin ?? false;
    return { roomId, userId, isAdmin };
  }

  @Post('activate')
  async activate(@Body() body: any, @Req() req: any, @Res() res: Response) {
    const { roomId, isAdmin } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');

    const parsed = this.decodeFromReq<ActivatePollsReq>(req, body, ActivatePollsReqSchema);
    const isActive = parsed?.isActive ?? true;

    const result = await firstValueFrom(
      this.natsClient.send({ cmd: 'poll.activate' }, {
        roomId,
        isActive,
        isAdmin,
      }),
    );
    return this.sendProto(res, result);
  }

  @Post('create')
  async create(@Body() body: CreatePollReq, @Req() req: any, @Res() res: Response) {
    const { roomId, userId, isAdmin } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');
    if (!userId) throw new BadRequestException('userId not found in token');

    const parsed = this.decodeFromReq<CreatePollReq>(req, body, CreatePollReqSchema);

    // Temporary diagnostics to inspect incoming payload shape
    this.logger.log(
      `polls.create rawType=${Buffer.isBuffer(req.body) ? 'buffer' : Array.isArray(req.body) ? 'array' : typeof req.body}` +
      ` rawLen=${Buffer.isBuffer(req.body) ? req.body.length : Array.isArray(req.body) ? req.body.length : 0}` +
      ` keys=${req.body && typeof req.body === 'object' ? Object.keys(req.body).join(',') : ''}`,
    );
    this.logger.log(`polls.create content-length=${req.headers?.['content-length'] || ''} content-type=${req.headers?.['content-type'] || ''}`);
    this.logger.log(`polls.create parsed=${JSON.stringify(parsed)}`);

    const result = await firstValueFrom(this.natsClient.send({ cmd: 'poll.create' }, {
      ...parsed,
      roomId,
      userId,
      isAdmin,
    }));
    return this.sendProto(res, result);
  }

  @Get('listPolls')
  async listPolls(@Req() req: any, @Res() res: Response) {
    const { roomId } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');
    const result = await firstValueFrom(this.natsClient.send({ cmd: 'poll.list' }, { roomId }));
    return this.sendProto(res, result);
  }

  @Post('closePoll')
  async closePoll(@Body() body: ClosePollReq, @Req() req: any, @Res() res: Response) {
    const { roomId, userId, isAdmin } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');
    if (!userId) throw new BadRequestException('userId not found in token');

    const parsed = this.decodeFromReq<ClosePollReq>(req, body, ClosePollReqSchema);

    const result = await firstValueFrom(this.natsClient.send({ cmd: 'poll.close' }, {
      ...parsed,
      roomId,
      userId,
      isAdmin,
    }));
    return this.sendProto(res, result);
  }

  @Post('submitResponse')
  async submitResponse(@Body() body: SubmitPollResponseReq, @Req() req: any, @Res() res: Response) {
    const { roomId, userId } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');
    if (!userId) throw new BadRequestException('userId not found in token');

    const parsed = this.decodeFromReq<SubmitPollResponseReq>(req, body, SubmitPollResponseReqSchema);

    const result = await firstValueFrom(this.natsClient.send({ cmd: 'poll.submit' }, {
      ...parsed,
      roomId,
      userId,
    }));
    return this.sendProto(res, result);
  }

  @Get('pollsStats')
  async pollsStats(@Req() req: any, @Res() res: Response) {
    const { roomId } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');
    const result = await firstValueFrom(this.natsClient.send({ cmd: 'poll.stats' }, { roomId }));
    return this.sendProto(res, result);
  }

  // Client GET endpoints for poll details
  @Get('countTotalResponses/:pollId')
  async countTotalResponses(@Param('pollId') pollId: string, @Req() req: any, @Res() res: Response) {
    const { roomId } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');
    const result = await firstValueFrom(
      this.natsClient.send({ cmd: 'poll.countResponses' }, { pollId, roomId }),
    );
    return this.sendProto(res, result);
  }

  @Get('userSelectedOption/:pollId/:userId')
  async userSelectedOption(
    @Param('pollId') pollId: string,
    @Param('userId') userId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { roomId } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');
    const result = await firstValueFrom(
      this.natsClient.send({ cmd: 'poll.userOption' }, { pollId, userId, roomId }),
    );
    return this.sendProto(res, result);
  }

  @Get('pollResponsesDetails/:pollId')
  async pollResponsesDetails(@Param('pollId') pollId: string, @Req() req: any, @Res() res: Response) {
    const { roomId, isAdmin } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');
    const result = await firstValueFrom(
      this.natsClient.send({ cmd: 'poll.responsesDetails' }, { pollId, roomId, isAdmin }),
    );
    return this.sendProto(res, result);
  }

  @Get('pollResponsesResult/:pollId')
  async pollResponsesResult(@Param('pollId') pollId: string, @Req() req: any, @Res() res: Response) {
    const { roomId } = this.getAuthContext(req);
    if (!roomId) throw new BadRequestException('roomId not found in token');
    const result = await firstValueFrom(
      this.natsClient.send({ cmd: 'poll.responsesResult' }, { pollId, roomId }),
    );
    return this.sendProto(res, result);
  }
}

