import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  connect,
  NatsConnection,
  StringCodec,
  JetStreamClient,
  JetStreamManager,
  nkeyAuthenticator,
  AckPolicy,
  DeliverPolicy,
} from 'nats';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private nc: NatsConnection;
  private js: JetStreamClient;
  private jsm: JetStreamManager;
  private sc = StringCodec();

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  async connect() {
    try {
      const opts: any = {
        servers: process.env.NATS_URL || 'nats://localhost:4222',
        name: 'nestjs-server',
      };

      if (process.env.NATS_NKEY_SEED) {
        opts.authenticator = nkeyAuthenticator(new TextEncoder().encode(process.env.NATS_NKEY_SEED));
      }

      this.nc = await connect(opts);
      this.js = this.nc.jetstream();
      this.jsm = await this.nc.jetstreamManager();
      console.log('Connected to NATS JetStream');
    } catch (err) {
      console.error('Error connecting to NATS:', err);
    }
  }

  async close() {
    if (this.nc) {
      await this.nc.drain();
      await this.nc.close();
    }
  }

  getConnection(): NatsConnection | undefined {
    return this.nc;
  }

  async publish(subject: string, data: Uint8Array | Record<string, any>) {
    if (!this.js) return;

    let payload: Uint8Array;
    if (data instanceof Uint8Array) {
      payload = data;
    } else {
      payload = this.sc.encode(JSON.stringify(data));
    }

    return this.js.publish(subject, payload);
  }

  // Subscribe using Push Consumer or specialized logic
  async subscribe(
    subject: string,
    queue: string,
    callback: (msg: any) => void,
  ) {
    // Basic subscription example
    const sub = this.nc.subscribe(subject, { queue });
    (async () => {
      for await (const m of sub) {
        callback(m);
      }
    })();
  }
  async kvPut(bucket: string, key: string, value: string | Uint8Array) {
    if (!this.js) return;
    try {
      // Ensure bucket exists - simpler approach for now: assume created or try create
      // In production, we might want to cache bucket handles.
      const kv = await this.js.views.kv(bucket, { history: 1 });
      await kv.put(
        key,
        typeof value === 'string' ? this.sc.encode(value) : value,
      );
    } catch (err) {
      console.error(`Error putting to KV bucket ${bucket}:`, err);
      // Try creating checking if bucket missing?
      // For now just log.
    }
  }

  async kvGet(bucket: string, key: string): Promise<Uint8Array | null> {
    if (!this.js) return null;
    try {
      const kv = await this.js.views.kv(bucket);
      const entry = await kv.get(key);
      return entry?.value || null;
    } catch (err) {
      return null;
    }
  }

  async kvDelete(bucket: string, key: string) {
    if (!this.js) return;
    try {
      const kv = await this.js.views.kv(bucket);
      await kv.delete(key);
    } catch (err) {
      console.error(`Error deleting from KV bucket ${bucket}:`, err);
    }
  }

  async createOrUpdateKv(bucket: string) {
    if (!this.jsm) return;
    try {
      await this.jsm.streams.add({
        name: `KV_${bucket}`,
        subjects: [`$KV.${bucket}.>`],
        history: 1,
      } as any);
      return await this.js.views.kv(bucket, { history: 1 });
    } catch (e) {
      return await this.js.views.kv(bucket);
    }
  }

  async updateRoomInfo(roomId: string, info: any) {
    const bucket = `pnm-roomInfo-${roomId}`;
    const kv = await this.createOrUpdateKv(bucket);
    if (!kv) return;

    const p: Promise<any>[] = [];
    if (info.roomId) p.push(kv.put('room_id', this.sc.encode(info.roomId)));
    if (info.roomSid) p.push(kv.put('sid', this.sc.encode(info.roomSid)));
    if (info.status) p.push(kv.put('status', this.sc.encode(info.status)));
    if (info.emptyTimeout)
      p.push(
        kv.put('empty_timeout', this.sc.encode(info.emptyTimeout.toString())),
      );
    if (info.maxParticipants)
      p.push(
        kv.put(
          'max_participants',
          this.sc.encode(info.maxParticipants.toString()),
        ),
      );
    if (info.createdAt)
      p.push(kv.put('created', this.sc.encode(info.createdAt.toString())));
    if (info.metadata)
      p.push(kv.put('metadata', this.sc.encode(info.metadata)));
    await Promise.all(p);
  }

  async deleteRoomInfo(roomId: string) {
    const bucket = `pnm-roomInfo-${roomId}`;
    try {
      await this.jsm?.streams.delete(`KV_${bucket}`);
    } catch (e) { }
  }

  async updateUserInfo(roomId: string, userId: string, info: any) {
    const bucket = `pnm-userInfo-r_${roomId}-u_${userId}`;
    const kv = await this.createOrUpdateKv(bucket);
    if (!kv) return;

    const p: Promise<any>[] = [];
    if (info.userId) p.push(kv.put('id', this.sc.encode(info.userId)));
    if (info.name) p.push(kv.put('name', this.sc.encode(info.name)));
    if (info.isAdmin !== undefined)
      p.push(kv.put('is_admin', this.sc.encode(String(info.isAdmin))));
    if (info.isPresenter !== undefined)
      p.push(kv.put('is_presenter', this.sc.encode(String(info.isPresenter))));
    if (info.metadata)
      p.push(kv.put('metadata', this.sc.encode(info.metadata)));
    if (info.joinedAt)
      p.push(kv.put('joined_at', this.sc.encode(info.joinedAt.toString())));
    await Promise.all(p);

    // Also update room users bucket
    const roomUsersBucket = `pnm-roomUsers-${roomId}`;
    const kvUsers = await this.createOrUpdateKv(roomUsersBucket);
    if (kvUsers) {
      await kvUsers.put(userId, this.sc.encode('online')); // Status
    }
  }

  async deleteUserInfo(roomId: string, userId: string) {
    const bucket = `pnm-userInfo-r_${roomId}-u_${userId}`;
    try {
      await this.jsm?.streams.delete(`KV_${bucket}`);
    } catch (e) { }

    const roomUsersBucket = `pnm-roomUsers-${roomId}`;
    try {
      const kv = await this.js.views.kv(roomUsersBucket);
      await kv.delete(userId);
    } catch (e) { }
  }

  async createStream(name: string, subjects: string[]) {
    if (!this.jsm) return;
    try {
      await this.jsm.streams.add({
        name,
        subjects,
      });
    } catch (e) {
      if (!e.message.includes('already in use')) {
        console.error(`Error creating stream ${name}:`, e);
      }
    }
  }

  async broadcastSystemEvent(
    event: number, // plugnmeet.NatsMsgServerToClientEvents enum
    roomId: string,
    msg: any,
    toUserId?: string,
  ) {
    if (!this.js) return;

    let subj = `pnm.system.public.${roomId}`;
    if (toUserId) {
      subj = `pnm.system.private.${roomId}.${toUserId}`;
    }

    // If msg is already binary (Protobuf), use it directly.
    // Otherwise, assume it's a JSON object/string and encode it.
    let payload: Uint8Array;

    if (msg instanceof Uint8Array) {
      payload = msg;
    } else {
      const payloadObj = {
        event: event,
        msg: typeof msg === 'string' ? msg : JSON.stringify(msg),
        roomId: roomId,
      };
      payload = this.sc.encode(JSON.stringify(payloadObj));
    }

    return this.publish(subj, payload);
  }

  async createRoomStream(roomId: string) {
    if (!this.jsm) return;
    const subjects = [
      `${roomId}:chat.*`,
      `${roomId}:sysPublic.*`,
      `${roomId}:sysPrivate.*.*`,
      `${roomId}:whiteboard.*`,
      `${roomId}:dataChannel.*`,
    ];

    try {
      const stream = await this.jsm.streams.info(roomId).catch(() => null);
      if (stream) {
        await this.jsm.streams.update(roomId, {
          subjects,
        });
      } else {
        await this.jsm.streams.add({
          name: roomId,
          subjects,
        });
      }
    } catch (e) {
      console.error(`Error creating room stream ${roomId}:`, e);
      throw e;
    }
  }

  async publishPayload(subject: string, payload: Uint8Array) {
    if (!this.js) return;
    return this.js.publish(subject, payload);
  }

  // --- Consumer Creation (Parity with js_consumer.go) ---

  async createChatConsumer(roomId: string, userId: string) {
    if (!this.jsm) return;
    const durable = `chat:${userId}`;
    const filterSubject = `${roomId}:chat.>`;
    await this.jsm.consumers.add(roomId, {
      durable_name: durable,
      filter_subjects: [filterSubject],
      ack_policy: AckPolicy.Explicit,
    });
  }

  async createSystemPublicConsumer(roomId: string, userId: string) {
    if (!this.jsm) return;
    const durable = `sysPublic:${userId}`;
    const filterSubject = `${roomId}:sysPublic.>`;
    await this.jsm.consumers.add(roomId, {
      durable_name: durable,
      deliver_policy: DeliverPolicy.New,
      filter_subjects: [filterSubject],
      ack_policy: AckPolicy.Explicit,
    });
  }

  async createSystemPrivateConsumer(roomId: string, userId: string) {
    if (!this.jsm) return;
    const durable = `sysPrivate:${userId}`;
    const filterSubject = `${roomId}:sysPrivate.${userId}.>`;
    await this.jsm.consumers.add(roomId, {
      durable_name: durable,
      deliver_policy: DeliverPolicy.New,
      filter_subjects: [filterSubject],
      ack_policy: AckPolicy.Explicit,
    });
  }

  async createWhiteboardConsumer(roomId: string, userId: string) {
    if (!this.jsm) return;
    const durable = `whiteboard:${userId}`;
    const filterSubject = `${roomId}:whiteboard.>`;
    await this.jsm.consumers.add(roomId, {
      durable_name: durable,
      deliver_policy: DeliverPolicy.New,
      filter_subjects: [filterSubject],
      ack_policy: AckPolicy.Explicit,
    });
  }

  async createDataChannelConsumer(roomId: string, userId: string) {
    if (!this.jsm) return;
    const durable = `dataChannel:${userId}`;
    const filterSubject = `${roomId}:dataChannel.>`;
    await this.jsm.consumers.add(roomId, {
      durable_name: durable,
      deliver_policy: DeliverPolicy.New,
      filter_subjects: [filterSubject],
      ack_policy: AckPolicy.Explicit,
    });
  }

  async deleteConsumers(roomId: string, userId: string) {
    if (!this.jsm) return;
    const consumers = [
      `chat:${userId}`,
      `sysPublic:${userId}`,
      `sysPrivate:${userId}`,
      `whiteboard:${userId}`,
      `dataChannel:${userId}`
    ];
    for (const durable of consumers) {
      try {
        await this.jsm.consumers.delete(roomId, durable);
      } catch (e) { }
    }
  }
}
