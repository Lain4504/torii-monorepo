import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { LiveKitService, NatsService } from '@server/shared';
import {
  BreakoutRoomRes,
  BreakoutRoomResSchema,
  BreakoutRoom,
  BroadcastBreakoutRoomMsgReq,
  CreateBreakoutRoomsReq,
  CreateRoomReqSchema,
  EndBreakoutRoomReq,
  IncreaseBreakoutRoomDurationReq,
  JoinBreakoutRoomReq,
  BreakoutRoomSchema,
  BreakoutRoomUserSchema,
  NatsMsgServerToClientEvents,
  RoomEndAPIReqSchema,
} from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import { RoomService } from './room.service';

@Injectable()
export class BreakoutRoomService {
  private readonly logger = new Logger(BreakoutRoomService.name);

  constructor(
    private readonly liveKitService: LiveKitService,
    @Inject(forwardRef(() => RoomService)) private readonly roomService: RoomService,
    private readonly natsService: NatsService,
  ) { }

  async createBreakoutRooms(data: CreateBreakoutRoomsReq): Promise<BreakoutRoomRes> {
    const parentRoomId = data.roomId;
    const durationSec = this.toNumber(data.duration);
    const parentInfo = await this.natsService.getRoomInfo(parentRoomId);
    if (!parentInfo || !parentInfo.roomId) {
      return create(BreakoutRoomResSchema, { status: false, msg: 'parent room not found', rooms: [] });
    }

    const parentMeta = this.safeJson(parentInfo.metadata) || {};
    if (!parentMeta.roomFeatures) parentMeta.roomFeatures = {};
    if (!parentMeta.roomFeatures.breakoutRoomFeatures) parentMeta.roomFeatures.breakoutRoomFeatures = {};

    // Treat 0/undefined as "no limit" because parent createRoom may omit roomDuration
    const parentDuration = this.toNumber(parentMeta.roomFeatures.roomDuration);
    if (parentDuration > 0 && durationSec > parentDuration) {
      this.logger.warn(
        `breakout create rejected: requested duration ${durationSec}s exceeds parent duration ${parentDuration}s for ${parentRoomId}`,
      );
      return create(BreakoutRoomResSchema, {
        status: false,
        msg: "breakout room's duration can't exceed parent room duration",
        rooms: [],
      });
    }

    const baseMeta = this.prepareBreakoutMetadata(parentMeta, parentRoomId, durationSec, data.welcomeMsg);

    let createdCount = 0;
    for (const roomReq of data.rooms) {
      const breakoutRoomId = `${parentRoomId}-${roomReq.id}`;
      const roomMeta = { ...baseMeta, roomTitle: roomReq.title };
      const roomDuration = this.toNumber(roomReq.duration) || durationSec;
      const breakoutRoom = create(BreakoutRoomSchema, {
        id: breakoutRoomId,
        title: roomReq.title,
        duration: String(roomDuration),
        started: false,
        created: String(Math.floor(Date.now() / 1000)),
        users: roomReq.users?.map((u) =>
          create(BreakoutRoomUserSchema, { id: u.id, name: u.name, joined: false }),
        ) || [],
      });

      try {
        await this.roomService.createRoom(
          create(CreateRoomReqSchema, {
            roomId: breakoutRoomId,
            metadata: roomMeta,
            emptyTimeout: roomDuration > 0 ? roomDuration : undefined,
          }),
        );

        await this.saveBreakoutRoom(parentRoomId, breakoutRoomId, breakoutRoom);

        for (const user of breakoutRoom.users) {
          await this.roomService.broadcastNatsEvent(
            NatsMsgServerToClientEvents.JOIN_BREAKOUT_ROOM,
            parentRoomId,
            breakoutRoomId,
            user.id,
          );
        }
        createdCount += 1;
      } catch (err: any) {
        this.logger.error(`Failed to create breakout room ${breakoutRoomId}: ${err.message}`);
      }
    }

    parentMeta.roomFeatures.breakoutRoomFeatures.isActive = true;
    try {
      await this.liveKitService.getRoomClient().updateRoomMetadata(parentRoomId, JSON.stringify(parentMeta));
    } catch (err: any) {
      this.logger.warn(`Failed to update parent room metadata: ${err.message}`);
    }

    if (createdCount === 0) {
      return create(BreakoutRoomResSchema, { status: false, msg: 'breakout room creation failed', rooms: [] });
    }

    return create(BreakoutRoomResSchema, { status: true, msg: 'success', rooms: [] });
  }

  async joinBreakoutRoom(data: JoinBreakoutRoomReq): Promise<BreakoutRoomRes> {
    const parentRoomId = data.roomId;
    let effectiveBreakoutId = this.normalizeBreakoutId(parentRoomId, data.breakoutRoomId);

    if (!effectiveBreakoutId) {
      const ids = await this.natsService.getBreakoutRoomIdsByParentRoomId(parentRoomId).catch(() => [] as string[]);
      if (ids.length >= 1) {
        effectiveBreakoutId = ids[0];
        this.logger.warn(`join breakout: missing breakoutRoomId, defaulting to ${effectiveBreakoutId} for parent=${parentRoomId} available=${ids.join(',')}`);
      } else {
        this.logger.warn(`join breakout: missing breakoutRoomId. parent=${parentRoomId} available=none`);
        return create(BreakoutRoomResSchema, { status: false, msg: 'breakout room not found', rooms: [] });
      }
    }

    const status = await this.natsService.getRoomUserStatus(effectiveBreakoutId, data.userId);
    if (status === 'online') {
      return create(BreakoutRoomResSchema, { status: false, msg: 'user has already been joined', token: undefined, rooms: [] });
    }

    const breakoutRoom = await this.fetchBreakoutRoom(parentRoomId, effectiveBreakoutId);
    if (!breakoutRoom) {
      const ids = await this.natsService.getBreakoutRoomIdsByParentRoomId(parentRoomId).catch(() => [] as string[]);
      this.logger.warn(`join breakout: room not found in KV. parent=${parentRoomId} breakout=${effectiveBreakoutId} existing=${ids.join(',')}`);
      return create(BreakoutRoomResSchema, { status: false, msg: 'breakout room not found', rooms: [] });
    }

    if (!data.isAdmin) {
      const allowed = breakoutRoom.users?.some((u) => u.id === data.userId);
      if (!allowed) {
        return create(BreakoutRoomResSchema, {
          status: false,
          msg: 'user is not allowed to join this breakout room',
          rooms: [],
        });
      }
    }

    const userInfo = await this.natsService.getUserInfo(parentRoomId, data.userId);
    if (!userInfo) {
      return create(BreakoutRoomResSchema, { status: false, msg: 'user not found in parent room', rooms: [] });
    }
    const name = userInfo.name || data.userId;

    const videoGrant = {
      roomJoin: true,
      room: effectiveBreakoutId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    };

    const breakoutInfo = await this.natsService.getRoomInfo(effectiveBreakoutId);
    const token = await this.liveKitService.createAccessToken(
      data.userId,
      name,
      videoGrant,
      breakoutInfo?.metadata || '',
    );

    return create(BreakoutRoomResSchema, { status: true, msg: 'success', token, rooms: [] });
  }

  async endBreakoutRoom(data: EndBreakoutRoomReq) {
    await this.roomService.endRoom(create(RoomEndAPIReqSchema, { roomId: data.breakoutRoomId }));
    await this.natsService.kvDelete(this.breakoutBucket(data.roomId), data.breakoutRoomId);
    await this.roomService.broadcastNatsEvent(
      NatsMsgServerToClientEvents.BREAKOUT_ROOM_ENDED,
      data.roomId,
      data.breakoutRoomId,
    );
    return create(BreakoutRoomResSchema, { status: true, msg: 'success', rooms: [] });
  }

  async endAllBreakoutRooms(data: { roomId: string }): Promise<BreakoutRoomRes> {
    const rooms = await this.fetchBreakoutRooms(data.roomId);

    for (const room of rooms) {
      await this.roomService.endRoom(create(RoomEndAPIReqSchema, { roomId: room.id }));
      await this.natsService.kvDelete(this.breakoutBucket(data.roomId), room.id);
    }

    try {
      const info = await this.natsService.getRoomInfo(data.roomId);
      if (info?.metadata) {
        const meta = this.safeJson(info.metadata) || {};
        if (meta.roomFeatures?.breakoutRoomFeatures) {
          meta.roomFeatures.breakoutRoomFeatures.isActive = false;
          await this.liveKitService.getRoomClient().updateRoomMetadata(data.roomId, JSON.stringify(meta));
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to update parent metadata after ending all breakout rooms: ${err.message}`);
    }

    await this.roomService.broadcastNatsEvent(
      NatsMsgServerToClientEvents.BREAKOUT_ROOM_ENDED,
      data.roomId,
      data.roomId,
    );

    return create(BreakoutRoomResSchema, { status: true, msg: 'success', rooms: [] });
  }

  async getBreakoutRooms(data: { roomId: string }): Promise<BreakoutRoomRes> {
    const rooms = await this.fetchBreakoutRooms(data.roomId);
    if (!rooms || rooms.length === 0) {
      return create(BreakoutRoomResSchema, { status: false, msg: 'no breakout rooms found', rooms: [] });
    }
    return create(BreakoutRoomResSchema, { status: true, msg: 'success', rooms });
  }

  async getMyBreakoutRooms(data: { roomId: string; userId: string }): Promise<BreakoutRoomRes> {
    const rooms = await this.fetchBreakoutRooms(data.roomId);
    if (!rooms || rooms.length === 0) {
      return create(BreakoutRoomResSchema, { status: false, msg: 'no breakout rooms found', rooms: [] });
    }

    for (const room of rooms) {
      if (room.users.some((u) => u.id === data.userId)) {
        return create(BreakoutRoomResSchema, { status: true, msg: 'success', room });
      }
    }
    return create(BreakoutRoomResSchema, { status: false, msg: 'not found', rooms: [] });
  }

  async increaseBreakoutRoomDuration(data: IncreaseBreakoutRoomDurationReq): Promise<BreakoutRoomRes> {
    const breakoutRoom = await this.fetchBreakoutRoom(data.roomId, data.breakoutRoomId);
    if (!breakoutRoom) {
      return create(BreakoutRoomResSchema, { status: false, msg: 'breakout room not found', rooms: [] });
    }

    const parentInfo = await this.natsService.getRoomInfo(data.roomId);
    const parentMeta = this.safeJson(parentInfo?.metadata || '{}') || {};
    const parentDuration = this.toNumber(parentMeta?.roomFeatures?.roomDuration || 0);

    const current = this.toNumber(breakoutRoom.duration);
    const requested = this.toNumber(data.duration);
    const newDuration = current + requested;
    if (parentDuration > 0 && newDuration > parentDuration) {
      this.logger.warn(
        `breakout increase rejected: requested total ${newDuration}s exceeds parent duration ${parentDuration}s for ${data.roomId}`,
      );
      return create(BreakoutRoomResSchema, {
        status: false,
        msg: "breakout room's duration can't exceed parent room duration",
        rooms: [],
      });
    }

    breakoutRoom.duration = String(newDuration);
    await this.saveBreakoutRoom(data.roomId, data.breakoutRoomId, breakoutRoom);

    return create(BreakoutRoomResSchema, { status: true, msg: 'success', rooms: [] });
  }

  async sendBreakoutRoomMsg(data: BroadcastBreakoutRoomMsgReq): Promise<BreakoutRoomRes> {
    const rooms = await this.fetchBreakoutRooms(data.roomId);
    if (!rooms || rooms.length === 0) {
      return create(BreakoutRoomResSchema, { status: true, msg: 'success', rooms: [] });
    }

    for (const room of rooms) {
      await this.roomService.broadcastNatsEvent(
        NatsMsgServerToClientEvents.SYSTEM_CHAT_MSG,
        room.id,
        data.msg,
      );
    }
    return create(BreakoutRoomResSchema, { status: true, msg: 'success', rooms: [] });
  }

  async postTaskAfterRoomStartWebhook(roomId: string, metadata: any) {
    const parentRoomId = metadata?.parentRoomId || metadata?.parent_room_id;
    if (!parentRoomId) {
      this.logger.warn(`post-start breakout task: missing parentRoomId for ${roomId}`);
      return;
    }

    // Allow LiveKit/NATS time to materialize the breakout room entry (mirrors Go wait)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const breakoutRoom = await this.fetchBreakoutRoom(parentRoomId, roomId);
    if (!breakoutRoom) {
      this.logger.warn(`post-start breakout task: breakout room not found in KV for ${roomId}`);
      return;
    }

    const startedAt = metadata?.startedAt || metadata?.started_at || Math.floor(Date.now() / 1000);
    breakoutRoom.created = String(startedAt);
    breakoutRoom.started = true;

    await this.saveBreakoutRoom(parentRoomId, roomId, breakoutRoom);
    this.logger.log(`post-start breakout task: marked ${roomId} as started`);
  }

  async postTaskAfterRoomEndWebhook(roomId: string, metadata?: string) {
    if (!metadata) return;
    const meta = this.safeJson(metadata);
    if (!meta) return;

    if (meta.isBreakoutRoom || meta.is_breakout_room) {
      const parentRoomId = meta.parentRoomId || meta.parent_room_id;
      if (!parentRoomId) {
        this.logger.warn(`post-end breakout task: missing parentRoomId for ${roomId}`);
        return;
      }
      await this.natsService.deleteBreakoutRoom(parentRoomId, roomId);
      await this.onAfterBkRoomEnded(parentRoomId, roomId);
      return;
    }

    // Parent room ended: end all child breakout rooms
    await this.endAllBreakoutRooms({ roomId }).catch((err) => {
      this.logger.warn(`post-end breakout task: failed to end all breakout rooms for ${roomId}: ${err.message}`);
    });
  }

  private async fetchBreakoutRooms(roomId: string): Promise<BreakoutRoom[]> {
    const all = await this.natsService.kvGetAll(this.breakoutBucket(roomId));
    const decoder = new TextDecoder();
    const breakoutRooms: BreakoutRoom[] = [];

    for (const [key, val] of Object.entries(all)) {
      const parsed = this.safeJson(decoder.decode(val));
      if (!parsed) continue;
      const room = create(BreakoutRoomSchema, {
        id: key,
        title: parsed.title || '',
        duration: String(this.toNumber(parsed.duration)),
        started: Boolean(parsed.started),
        created: String(parsed.created || 0),
        users: Array.isArray(parsed.users)
          ? parsed.users.map((u: any) =>
            create(BreakoutRoomUserSchema, { id: u.id, name: u.name, joined: Boolean(u.joined) }))
          : [],
      });

      if (room.started) {
        for (const user of room.users) {
          const status = await this.natsService.getRoomUserStatus(room.id, user.id);
          if (status === 'online') {
            user.joined = true;
          }
        }
      }

      breakoutRooms.push(room);
    }
    return breakoutRooms;
  }

  private async fetchBreakoutRoom(parentRoomId: string, breakoutRoomId: string): Promise<BreakoutRoom | null> {
    const val = await this.natsService.kvGet(this.breakoutBucket(parentRoomId), breakoutRoomId);
    if (!val) return null;
    const parsed = this.safeJson(new TextDecoder().decode(val));
    if (!parsed) return null;
    return create(BreakoutRoomSchema, {
      id: breakoutRoomId,
      title: parsed.title || '',
      duration: String(this.toNumber(parsed.duration)),
      started: Boolean(parsed.started),
      created: String(parsed.created || 0),
      users: Array.isArray(parsed.users)
        ? parsed.users.map((u: any) =>
          create(BreakoutRoomUserSchema, { id: u.id, name: u.name, joined: Boolean(u.joined) }))
        : [],
    });
  }

  private async saveBreakoutRoom(parentRoomId: string, breakoutRoomId: string, room: BreakoutRoom) {
    const payload = {
      ...room,
      duration: room.duration,
      created: room.created,
      started: room.started,
      users: room.users,
    };
    await this.natsService.kvPut(this.breakoutBucket(parentRoomId), breakoutRoomId, JSON.stringify(payload));
    this.logger.debug(`saved breakout room ${breakoutRoomId} under parent ${parentRoomId}`);
  }

  private async onAfterBkRoomEnded(parentRoomId: string, bkRoomId: string) {
    try {
      const count = await this.natsService.countBreakoutRooms(parentRoomId);
      if (count === 0) {
        await this.natsService.deleteAllBreakoutRoomsByParentRoomId(parentRoomId);
        await this.updateParentRoomMetadata(parentRoomId);
      }
    } catch (err: any) {
      this.logger.warn(`post-end breakout task: metadata cleanup failed for parent ${parentRoomId}: ${err.message}`);
    }

    try {
      await this.roomService.broadcastNatsEvent(
        NatsMsgServerToClientEvents.BREAKOUT_ROOM_ENDED,
        parentRoomId,
        bkRoomId,
      );
    } catch (err: any) {
      this.logger.warn(`post-end breakout task: failed to broadcast BREAKOUT_ROOM_ENDED for ${bkRoomId}: ${err.message}`);
    }
  }

  private async updateParentRoomMetadata(parentRoomId: string) {
    const info = await this.natsService.getRoomInfo(parentRoomId).catch(() => null as any);
    if (!info?.metadata) return;
    const meta = this.safeJson(info.metadata) || {};
    if (!meta.roomFeatures) meta.roomFeatures = {};
    if (!meta.roomFeatures.breakoutRoomFeatures) meta.roomFeatures.breakoutRoomFeatures = {};
    if (!meta.room_features) meta.room_features = meta.roomFeatures;
    if (!meta.room_features) meta.room_features = {} as any;
    if (!meta.room_features.breakout_room_features) {
      meta.room_features.breakout_room_features = meta.roomFeatures.breakoutRoomFeatures;
    }

    if (meta.roomFeatures.breakoutRoomFeatures.isActive === false) return;

    meta.roomFeatures.breakoutRoomFeatures.isActive = false;
    meta.roomFeatures.breakoutRoomFeatures.is_active = false;
    meta.room_features.breakout_room_features.isActive = false;
    meta.room_features.breakout_room_features.is_active = false;
    try {
      await this.liveKitService.getRoomClient().updateRoomMetadata(parentRoomId, JSON.stringify(meta));
    } catch (err: any) {
      this.logger.warn(`post-end breakout task: failed to update parent metadata for ${parentRoomId}: ${err.message}`);
    }
  }

  private breakoutBucket(parentRoomId: string) {
    return `wajlc-breakoutRoom-${parentRoomId}`;
  }

  private normalizeBreakoutId(parentRoomId: string, breakoutRoomId?: string | null): string | null {
    const trimmed = (breakoutRoomId || '').trim();
    if (!trimmed) return null;
    if (trimmed.startsWith(`${parentRoomId}-`)) return trimmed;
    return `${parentRoomId}-${trimmed}`;
  }

  private toNumber(val?: string | number) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.trim() !== '') {
      const n = Number(val);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  private safeJson(str: any): any {
    if (!str) return null;
    try {
      return typeof str === 'string' ? JSON.parse(str) : str;
    } catch {
      return null;
    }
  }

  private prepareBreakoutMetadata(baseMeta: any, parentRoomId: string, duration: number, welcomeMsg?: string) {
    const meta = JSON.parse(JSON.stringify(baseMeta || {}));
    meta.isBreakoutRoom = true;
    meta.parentRoomId = parentRoomId;
    meta.welcomeMessage = welcomeMsg ?? meta.welcomeMessage;
    if (!meta.roomFeatures) meta.roomFeatures = {};
    if (!meta.roomFeatures.breakoutRoomFeatures) meta.roomFeatures.breakoutRoomFeatures = {};
    meta.roomFeatures.breakoutRoomFeatures.isAllow = false;
    meta.roomFeatures.breakoutRoomFeatures.isActive = true;
    if (!meta.roomFeatures.waitingRoomFeatures) meta.roomFeatures.waitingRoomFeatures = {};
    meta.roomFeatures.waitingRoomFeatures.isActive = false;
    if (!meta.roomFeatures.recordingFeatures) meta.roomFeatures.recordingFeatures = {};
    meta.roomFeatures.recordingFeatures.isAllow = false;
    meta.roomFeatures.allowRtmp = false;
    if (meta.roomFeatures.displayExternalLinkFeatures) {
      meta.roomFeatures.displayExternalLinkFeatures.isActive = false;
    }
    if (meta.roomFeatures.externalMediaPlayerFeatures) {
      meta.roomFeatures.externalMediaPlayerFeatures.isActive = false;
    }
    // Ensure roomDuration is always encoded as string; 0 means "no limit" for breakouts
    const durationVal = duration > 0 ? duration : 0;
    meta.roomFeatures.roomDuration = String(durationVal);
    if (!meta.room_features) meta.room_features = meta.roomFeatures;
    if (!meta.room_features) meta.room_features = {} as any;
    meta.room_features.room_duration = String(durationVal);
    return meta;
  }
}


