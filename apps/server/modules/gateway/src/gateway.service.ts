import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { verify } from 'jsonwebtoken';
import { VerifyTokenRes, NatsSubjects, VerifyTokenResSchema, NatsSubjectsSchema } from '@workspace/protocol';
import { create, toBinary } from '@bufbuild/protobuf';
import { NatsService } from '@server/shared';

export type AuthHealthResponse = { service: string; status: string };

@Injectable()
export class GatewayService {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly natsService: NatsService,
  ) { }

  async pingAuth(): Promise<AuthHealthResponse> {
    return lastValueFrom(
      this.natsClient.send<AuthHealthResponse>({ cmd: 'auth.ping' }, {}),
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

    // Extract claims from plugNmeet JWT format
    // plugNmeet JWT has: room_id, user_id, is_admin (not video.room)
    const roomId = decoded.room_id || decoded.video?.room || decoded.room;
    const userId = decoded.user_id || decoded.sub;
    const isAdmin = decoded.is_admin ?? decoded.video?.roomAdmin ?? false;
    const isHidden = decoded.is_hidden ?? decoded.video?.hidden ?? false;

    if (!roomId || !userId) {
      throw new UnauthorizedException('Invalid token claims');
    }

    // NATS configuration
    // Default to localhost if not set
    const natsUrl = this.configService.get<string>(
      'NATS_WS_URL',
      'ws://localhost:8222',
    );

    //  Construct NATS Subjects
    // Using standard patterns
    const natsSubjects = create(NatsSubjectsSchema, {
      systemApiWorker: 'sysApiWorker',
      systemJsWorker: 'sysJsWorker',
      systemPublic: 'sysPublic',
      systemPrivate: 'sysPrivate',
      chat: 'chat',
      whiteboard: 'whiteboard',
      dataChannel: 'dataChannel',
    });

    const res = create(VerifyTokenResSchema, {
      status: true,
      msg: 'success',
      natsWsUrls: [natsUrl],
      roomId: roomId,
      userId: userId,
      natsSubjects: natsSubjects,
      isCloud: false,
      enabledSelfInsertEncryptionKey: false, // TODO: Configurable?
    });

    // Persist Room & User Info to JetStream KV
    // This is required for SystemWorkerService to handle REQ_INITIAL_DATA
    // Room Info should be managed by RoomService (created at room creation).
    // Updating it here with User Metadata overwrites the Room Features!
    // await this.natsService.updateRoomInfo(roomId, {
    //   roomId: roomId,
    //   sid: this.randomString(12), // TODO: use real SID if available
    //   status: 1, // Active
    //   maxParticipants: 100, // TODO: Configurable
    //   createdAt: Math.floor(Date.now() / 1000),
    //   metadata: decoded.metadata || "",
    // });

    // Parse metadata to ensure consistency between top-level flags and metadata JSON
    let metadataObj: any = {};
    if (decoded.metadata) {
      try {
        metadataObj = JSON.parse(decoded.metadata);
      } catch (e) {
        // preserve original string if parse fails? fallback to empty obj
      }
    }

    // Determine roles (using values from token)
    // If token doesn't have is_admin, fall back to old video.roomJoin logic
    // const isAdmin = already extracted above
    // const isPresenter = decoded.video?.canPublish === true || false;

    // Sync roles into metadata
    metadataObj.isAdmin = isAdmin;
    metadataObj.isPresenter = isAdmin; // Admin users are presenters in plugNmeet
    const metadataStr = JSON.stringify(metadataObj);

    await this.natsService.updateUserInfo(roomId, userId, {
      userId: userId,
      name: decoded.name || userId,
      isAdmin: isAdmin,
      isPresenter: isAdmin, // Use same value
      metadata: metadataStr,
      joinedAt: Math.floor(Date.now() / 1000),
    });

    return toBinary(VerifyTokenResSchema, res);
  }

  // Define helper for random string if not imported
  private randomString(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

