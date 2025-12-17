import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  connect,
  NatsConnection,
  StringCodec,
  nkeyAuthenticator,
  AckPolicy,
  DeliverPolicy,
  ConsumerConfig,
  JsMsg,
  headers,
  JetStreamClient,
  JetStreamManager,
  StorageType,
  RetentionPolicy,
} from 'nats';
import {
  NatsMsgServerToClient,
  NatsMsgServerToClientEvents,
} from '@workspace/protocol';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private nc: NatsConnection;
  private js: JetStreamClient;
  private jsm: JetStreamManager;
  private logger = new Logger(NatsService.name);
  private sc = StringCodec();
  private uid = { newId: () => uuidv4() }; // Simple helper to match usage

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    await this.connect();
    await this.ensureGlobalStreams();
  }

  async ensureGlobalStreams() {
    if (!this.jsm) {
      this.logger.warn('JetStream Manager not available, skipping global stream creation.');
      return;
    };

    const streamName = 'plugnmeet_analytics';
    const subjects = ['plugnmeet_analytics'];

    try {
      const stream = await this.jsm.streams.info(streamName).catch(() => null);
      if (!stream) {
        this.logger.log(`Creating global stream: ${streamName}`);
        await this.jsm.streams.add({
          name: streamName,
          subjects: subjects,
          storage: StorageType.File,
          retention: RetentionPolicy.Limits,
        } as any);
      } else {
        // Optional: Update if exists to ensure subjects match
        // await this.jsm.streams.update(streamName, { subjects });
      }
    } catch (e) {
      this.logger.error(`Error ensuring global stream ${streamName}: ${e.message}`);
    }
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
      console.error(`Error putting to KV bucket ${bucket}: `, err);
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
      console.error(`Error deleting from KV bucket ${bucket}: `, err);
    }
  }

  async getRoomInfo(roomId: string) {
    const bucket = `pnm-roomInfo-${roomId}`;
    const kv = await this.js.views.kv(bucket);
    const roomInfo: any = {
      dbTableId: 0,
      roomId: "",
      roomSid: "",
      status: "", // Enum as string or number? Proto says string status, but logic used parse int? Checking proto again.. proto says string status.
      emptyTimeout: 0,
      maxParticipants: 0,
      metadata: "{}",
      createdAt: 0,
    };

    try {
      const e = await kv.get('room_id');
      if (e) roomInfo.roomId = this.sc.decode(e.value);
    } catch (e) { }
    try {
      const e = await kv.get('sid');
      if (e) roomInfo.roomSid = this.sc.decode(e.value);
    } catch (e) { }
    try {
      const e = await kv.get('status');
      // Helper previously parsedInt, but proto def shows `status: string`. 
      // Checking simple grep output line 780: message.status = reader.string();
      // So it should be string.
      if (e) roomInfo.status = this.sc.decode(e.value);
    } catch (e) { }
    try {
      const e = await kv.get('empty_timeout');
      if (e) roomInfo.emptyTimeout = parseInt(this.sc.decode(e.value));
    } catch (e) { }
    try {
      const e = await kv.get('max_participants');
      if (e) roomInfo.maxParticipants = parseInt(this.sc.decode(e.value));
    } catch (e) { }
    try {
      const e = await kv.get('created');
      if (e) roomInfo.createdAt = parseInt(this.sc.decode(e.value));
    } catch (e) { }
    try {
      const e = await kv.get('metadata');
      if (e) {
        const val = this.sc.decode(e.value);
        roomInfo.metadata = val && val !== "" ? val : "{}";
      }
    } catch (e) { }

    return roomInfo;
  }

  async getUserInfo(roomId: string, userId: string) {
    const bucket = `pnm-userInfo-r_${roomId}-u_${userId}`;
    const kv = await this.js.views.kv(bucket);
    const userInfo: any = {
      userId: "",
      userSid: "",
      name: "",
      roomId: "",
      isAdmin: false,
      isPresenter: false,
      metadata: "{}",
      joinedAt: 0,
      reconnectedAt: 0,
      disconnectedAt: 0,
    };

    try {
      const e = await kv.get('id');
      if (e) userInfo.userId = this.sc.decode(e.value);
    } catch (e) { }
    try {
      const e = await kv.get('name');
      if (e) userInfo.name = this.sc.decode(e.value);
    } catch (e) { }
    try {
      const e = await kv.get('is_admin');
      if (e) userInfo.isAdmin = this.sc.decode(e.value) === 'true';
    } catch (e) { }
    try {
      const e = await kv.get('is_presenter');
      if (e) userInfo.isPresenter = this.sc.decode(e.value) === 'true';
    } catch (e) { }
    try {
      const e = await kv.get('metadata');
      if (e) {
        const val = this.sc.decode(e.value);
        userInfo.metadata = val && val !== "" ? val : "{}";
      }
    } catch (e) { }
    try {
      const e = await kv.get('joined_at');
      if (e) userInfo.joinedAt = parseInt(this.sc.decode(e.value));
    } catch (e) { }

    return userInfo;
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
        console.error(`Error creating stream ${name}: `, e);
      }
    }
  }

  async broadcastSystemEvent(
    event: NatsMsgServerToClientEvents,
    roomId: string,
    msg: Uint8Array | string,
    toUserId?: string,
  ) {
    let message: Uint8Array;
    if (typeof msg === 'string') {
      const payload: NatsMsgServerToClient = {
        id: this.uid.newId(),
        event: event,
        msg: msg,
      };
      message = NatsMsgServerToClient.encode(payload).finish();
    } else {
      const payload: NatsMsgServerToClient = {
        id: this.uid.newId(),
        event: event,
        msg: this.sc.decode(msg),
      };
      message = NatsMsgServerToClient.encode(payload).finish();
    }

    let subj = `${roomId}:sysPublic.system`;
    if (toUserId) {
      subj = `${roomId}:sysPrivate.${toUserId}.system`;
    }

    return this.publish(subj, message);
  }

  async createRoomStream(roomId: string) {
    if (!this.jsm) return;
    const subjects = [
      `${roomId}:chat.*`,
      `${roomId}:sysPublic.*`,
      `${roomId}:sysPrivate.*.*`,
      `${roomId}:whiteboard.*`,
      `${roomId}:dataChannel.*`,
      `sysJsWorker.${roomId}.>`,
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
      console.error(`Error creating room stream ${roomId}: `, e);
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

  /**
   * Get online users list
   * Matches Go: GetOnlineUsersList
   */
  async getOnlineUsersList(roomId: string): Promise<any[]> {
    this.logger.debug(`[getOnlineUsersList] Called for room ${roomId}`);

    try {
      // Step 1: Get all online user IDs
      const userIds = await this.getOnlineUsersId(roomId);
      this.logger.debug(`[getOnlineUsersList] Got ${userIds.length} online user IDs: ${JSON.stringify(userIds)}`);

      if (!userIds || userIds.length === 0) {
        this.logger.warn(`[getOnlineUsersList] No online users in room ${roomId}`);
        return [];
      }

      // Step 2: Fetch full user info for each ID
      const users: any[] = [];
      for (const userId of userIds) {
        try {
          const userInfo = await this.getUserInfo(roomId, userId);
          if (userInfo && userInfo.userId) {
            users.push(userInfo);
            this.logger.debug(`[getOnlineUsersList] Added user ${userId}`);
          }
        } catch (e) {
          this.logger.warn(`[getOnlineUsersList] Failed to get info for user ${userId}: ${e.message}`);
        }
      }

      this.logger.log(`[getOnlineUsersList] Returning ${users.length} users for room ${roomId}`);
      return users;
    } catch (e) {
      this.logger.error(`[getOnlineUsersList] Error for room ${roomId}: ${e.message}`);
      return [];
    }
  }

  async getRoomUserStatus(roomId: string, userId: string): Promise<string> {
    const roomUsersBucket = `pnm-roomUsers-${roomId}`;
    try {
      const kv = await this.js.views.kv(roomUsersBucket);
      const entry = await kv.get(userId);
      return entry ? this.sc.decode(entry.value) : '';
    } catch (e) {
      return '';
    }
  }

  async updateUserStatus(roomId: string, userId: string, status: string) {
    const roomUsersBucket = `pnm-roomUsers-${roomId}`;
    try {
      const kv = await this.createOrUpdateKv(roomUsersBucket);
      if (kv) {
        await kv.put(userId, this.sc.encode(status));
      }
    } catch (e) {
      this.logger.error(`Error updating user status: ${e.message}`);
    }
  }

  /**
   * Add/Save user to NATS KV
   * Matches Go: NatsService.AddUser()
   */
  async addUser(
    roomId: string,
    userId: string,
    name: string,
    isAdmin: boolean,
    isPresenter: boolean,
    metadata: any // UserMetadata object
  ) {
    try {
      // 1. Add user to room users bucket (status: 'added')
      const roomUsersBucket = `pnm-roomUsers-${roomId}`;
      const roomKv = await this.createOrUpdateKv(roomUsersBucket);
      if (roomKv) {
        await roomKv.put(userId, this.sc.encode('added'));
      }

      // 2. Create user info bucket
      const userInfoBucket = `pnm-userInfo-r_${roomId}-u_${userId}`;
      const userKv = await this.createOrUpdateKv(userInfoBucket);
      if (!userKv) {
        throw new Error('Failed to create user info bucket');
      }

      // 3. Marshal metadata to JSON string
      const metadataJson = JSON.stringify(metadata || {});

      // 4. Generate user sid
      const { v4: uuidv4 } = require('uuid');
      const userSid = uuidv4();

      // 5. Save all user data
      const userData = {
        id: userId,
        sid: userSid,
        name: name,
        room_id: roomId,
        is_admin: isAdmin.toString(),
        is_presenter: isPresenter.toString(),
        metadata: metadataJson,
        last_ping_at: '0',
      };

      for (const [key, value] of Object.entries(userData)) {
        await userKv.put(key, this.sc.encode(value));
      }

      this.logger.log(`Added user ${userId} to room ${roomId} in NATS KV`);
    } catch (e) {
      this.logger.error(`Error adding user to NATS: ${e.message}`);
      throw e;
    }
  }

  /**
   * Broadcast system event to all online users except one
   * Matches Go: BroadcastSystemEventToEveryoneExceptUserId
   */
  async broadcastSystemEventToEveryoneExceptUserId(
    event: any, // NatsMsgServerToClientEvents
    roomId: string,
    data: any,
    exceptUserId: string
  ) {
    try {
      // Get all online user IDs
      const userIds = await this.getOnlineUsersId(roomId);
      if (!userIds || userIds.length === 0) {
        this.logger.warn(`No online users found in room ${roomId}`);
        return;
      }

      // Broadcast to each user except the excluded one
      for (const userId of userIds) {
        if (userId !== exceptUserId) {
          // Fire and forget (like Go's goroutine)
          setImmediate(async () => {
            try {
              await this.broadcastSystemEvent(event, roomId, data, userId);
            } catch (e) {
              this.logger.error(`Failed to broadcast to ${userId}: ${e.message}`);
            }
          });
        }
      }
    } catch (e) {
      this.logger.error(`Error broadcasting to room: ${e.message}`);
    }
  }

  /**
   * Get list of online user IDs
   * Matches Go: GetOnlineUsersId via GetRoomAllUsersFromStatusBucket
   */
  async getOnlineUsersId(roomId: string): Promise<string[]> {
    const roomUsersBucket = `pnm-roomUsers-${roomId}`;
    this.logger.debug(`[getOnlineUsersId] Getting IDs for room ${roomId} from bucket ${roomUsersBucket}`);

    try {
      const kv = await this.js.views.kv(roomUsersBucket);

      // CRITICAL: Collect ALL keys into array first (matching Go's ListKeys pattern)
      // This ensures we get a complete snapshot of ALL keys at this moment
      const keyIterator = await kv.keys();
      const allKeys: string[] = [];

      for await (const key of keyIterator) {
        allKeys.push(key);
      }

      this.logger.debug(`[getOnlineUsersId] Collected ${allKeys.length} total keys from KV: ${JSON.stringify(allKeys)}`);

      // Now process the collected keys to filter for 'online' status
      const userIds: string[] = [];
      let onlineCount = 0;

      for (const key of allKeys) {
        try {
          const entry = await kv.get(key);
          if (!entry) {
            this.logger.debug(`[getOnlineUsersId] Key ${key}: entry is null`);
            continue;
          }

          const status = this.sc.decode(entry.value);
          this.logger.debug(`[getOnlineUsersId] Key ${key}: status='${status}'`);

          // Only include online users
          if (status === 'online') {
            onlineCount++;
            userIds.push(key);
            this.logger.debug(`[getOnlineUsersId] Added ${key} to online list`);
          }
        } catch (e) {
          this.logger.warn(`[getOnlineUsersId] Error processing key ${key}: ${e.message}`);
          continue;
        }
      }

      this.logger.log(`[getOnlineUsersId] Processed ${allKeys.length} keys, found ${onlineCount} online: ${JSON.stringify(userIds)}`);
      return userIds;
    } catch (e) {
      this.logger.error(`[getOnlineUsersId] Error for room ${roomId}: ${e.message}`);
      return [];
    }
  }

  /**
   * Update a specific key-value pair for a user
   * Matches Go: UpdateUserKeyValue
   */
  async updateUserKeyValue(roomId: string, userId: string, key: string, val: string) {
    const userInfoBucket = `pnm-userInfo-r_${roomId}-u_${userId}`;
    try {
      const kv = await this.js.views.kv(userInfoBucket);
      await kv.put(key, this.sc.encode(val));
    } catch (e) {
      this.logger.error(`Error updating user key-value: ${e.message}`);
      throw e;
    }
  }

  /**
   * Send info notification to user
   * Matches Go: NotifyInfoMsg → BroadcastSystemNotificationToRoom
   */
  async notifyInfoMsg(roomId: string, msg: string, withSound: boolean, userId: string) {
    try {
      // Generate UUID for notification
      const crypto = require('crypto');
      const id = crypto.randomUUID();

      // Match protobuf NatsSystemNotification schema
      const notification = {
        id: id,
        type: 0, // NATS_SYSTEM_NOTIFICATION_INFO
        msg: msg,
        sent_at: Date.now(),
        with_sound: withSound
      };

      await this.broadcastSystemEvent(
        12, // SYSTEM_NOTIFICATION event (NatsMsgServerToClientEvents_SYSTEM_NOTIFICATION)
        roomId,
        JSON.stringify(notification),
        userId
      );
    } catch (e) {
      this.logger.error(`Error sending info notification: ${e.message}`);
    }
  }

  /**
   * Add room to NATS KV
   * Matches Go: NatsService.AddRoom()
   */
  async addRoom(
    tableId: string,
    roomId: string,
    roomSid: string,
    emptyTimeout: number,
    maxParticipants: number,
    metadata: any
  ) {
    const bucket = `pnm-roomInfo-${roomId}`;
    this.logger.debug(`Adding room to NATS KV bucket: ${bucket}`);

    try {
      const kv = await this.createOrUpdateKv(bucket);
      if (!kv) {
        throw new Error('Failed to create room info bucket');
      }

      // Defaults
      const timeout = emptyTimeout || 1800; // 30 minutes
      const maxPart = maxParticipants || 0; // 0 = unlimited

      // Marshal metadata
      const metadataJson = JSON.stringify(metadata || {});

      // Prepare room data
      const roomData = {
        id: tableId,
        room_id: roomId,
        room_sid: roomSid,
        empty_timeout: timeout.toString(),
        max_participants: maxPart.toString(),
        status: 'created',
        created_at: Math.floor(Date.now() / 1000).toString(),
        metadata: metadataJson,
      };

      // Store key-value pairs
      for (const [key, value] of Object.entries(roomData)) {
        await kv.put(key, this.sc.encode(value));
      }

      this.logger.log(`Room ${roomId} added to NATS KV successfully`);
    } catch (e) {
      this.logger.error(`Error adding room to NATS: ${e.message}`);
      throw e;
    }
  }
}

