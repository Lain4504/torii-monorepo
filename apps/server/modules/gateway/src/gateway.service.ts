import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { verify } from 'jsonwebtoken';
import { VerifyTokenRes, NatsSubjects } from '@server/proto';

export type AuthHealthResponse = { service: string; status: string };
export type ValidateTokenResponse = { isValid: boolean };

@Injectable()
export class GatewayService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly configService: ConfigService,
  ) { }

  async pingAuth(): Promise<AuthHealthResponse> {
    return lastValueFrom(
      this.authClient.send<AuthHealthResponse>({ cmd: 'auth.ping' }, {}),
    );
  }

  async validateToken(token?: string): Promise<ValidateTokenResponse> {
    return lastValueFrom(
      this.authClient.send<ValidateTokenResponse>(
        { cmd: 'auth.validate-token' },
        { token },
      ),
    );
  }

  async verifyPnmToken(authHeader: string, body: Buffer): Promise<Uint8Array> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = authHeader.split(' ')[1];

    const secret = this.configService.get<string>('LIVEKIT_API_SECRET');
    if (!secret) {
      throw new Error('LIVEKIT_API_SECRET not configured');
    }

    let decoded: any;
    try {
      decoded = verify(token, secret);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }

    const roomId = decoded.video?.room || decoded.room;
    const userId = decoded.sub;

    if (!roomId || !userId) {
      throw new UnauthorizedException('Invalid token claims');
    }

    // NATS configuration
    // Default to localhost if not set
    const natsUrl = this.configService.get<string>('NATS_WS_URL', 'ws://localhost:9222');

    // Construct NATS Subjects
    // Using standard PlugNmeet patterns
    // Construct NATS Subjects
    // Using standard PlugNmeet patterns
    const natsSubjects: NatsSubjects = {
      systemApiWorker: "pnm.api.worker",
      systemJsWorker: "pnm.js.worker",
      systemPublic: "pnm.system.public",
      systemPrivate: "pnm.system.private",
      chat: "pnm.chat",
      whiteboard: "pnm.whiteboard",
      dataChannel: "pnm.datachannel",
    };

    const res: VerifyTokenRes = {
      status: true,
      msg: "success",
      natsWsUrls: [natsUrl],
      roomId: roomId,
      userId: userId,
      natsSubjects: natsSubjects,
      isCloud: false,
      enabledSelfInsertEncryptionKey: false, // TODO: Configurable?
    };

    return VerifyTokenRes.encode(res).finish();
  }
}
