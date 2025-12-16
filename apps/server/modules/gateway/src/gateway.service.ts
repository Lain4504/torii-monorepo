import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { verify } from 'jsonwebtoken';
import { VerifyTokenRes, NatsSubjects } from '@server/proto';
import { NatsService } from '@server/shared';

export type AuthHealthResponse = { service: string; status: string };
export type ValidateTokenResponse = { isValid: boolean };

@Injectable()
export class GatewayService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly natsService: NatsService,
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
    if (!authHeader) {
      throw new UnauthorizedException('Missing token');
    }

    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

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
    const natsUrl = this.configService.get<string>('NATS_WS_URL', 'ws://localhost:8222');

    // Construct NATS Subjects
    // Using standard PlugNmeet patterns
    // Construct NATS Subjects
    // Using standard PlugNmeet patterns
    const natsSubjects: NatsSubjects = {
      systemApiWorker: "sysApiWorker",
      systemJsWorker: "sysJsWorker",
      systemPublic: "sysPublic",
      systemPrivate: "sysPrivate",
      chat: "chat",
      whiteboard: "whiteboard",
      dataChannel: "dataChannel",
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
    console.log(`result of verifyPnmToken: `, res);

    // Persist Room & User Info to JetStream KV
    // This is required for SystemWorkerService to handle REQ_INITIAL_DATA
    await this.natsService.updateRoomInfo(roomId, {
      roomId: roomId,
      sid: this.randomString(12), // TODO: use real SID if available
      status: 1, // Active
      maxParticipants: 100, // TODO: Configurable
      createdAt: Math.floor(Date.now() / 1000),
      metadata: decoded.metadata || "",
    });

    await this.natsService.updateUserInfo(roomId, userId, {
      userId: userId,
      name: decoded.name || userId,
      isAdmin: decoded.video?.roomJoin === true || false, // Simplify admin check
      isPresenter: decoded.video?.canPublish === true || false,
      metadata: decoded.metadata || "",
      joinedAt: Math.floor(Date.now() / 1000),
    });

    return VerifyTokenRes.encode(res).finish();
  }

  // Define helper for random string if not imported
  private randomString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
