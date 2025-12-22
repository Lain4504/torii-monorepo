import { Injectable, Logger } from '@nestjs/common';
import {
  PrismaService,
  RedisService,
  NatsService,
} from '@server/shared';
import {
  AnalyticsDataMsg,
  AnalyticsEventType,
  AnalyticsEvents,
  AnalyticsRedisUserInfo,
  AnalyticsRedisUserInfoSchema,
  FetchAnalyticsReq,
  FetchAnalyticsResult,
  FetchAnalyticsResultSchema,
  AnalyticsInfo,
  AnalyticsInfoSchema,
} from '@workspace/protocol';
import { create, toJson } from '@bufbuild/protobuf';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';

const ANALYTICS_ROOM_KEY = 'plugnmeet:analytics:%s';
const ANALYTICS_USER_KEY = ANALYTICS_ROOM_KEY + ':user:%s';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly natsService: NatsService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Handle analytics event
   * Matches Go: AnalyticsModel.HandleEvent()
   */
  async handleEvent(data: AnalyticsDataMsg) {
    const analyticsEnabled = this.configService.get('analytics.enabled', false);
    if (!analyticsEnabled) {
      return;
    }

    switch (data.eventType) {
      case AnalyticsEventType.ROOM:
        await this.handleRoomTypeEvents(data);
        break;
      case AnalyticsEventType.USER:
        await this.handleUserTypeEvents(data);
        break;
    }
  }

  /**
   * Handle room-level analytics events
   * Matches Go: AnalyticsModel.handleRoomTypeEvents()
   */
  private async handleRoomTypeEvents(data: AnalyticsDataMsg) {
    if (data.eventName === AnalyticsEvents.ANALYTICS_EVENT_UNKNOWN) {
      return;
    }

    const key = ANALYTICS_ROOM_KEY.replace('%s', data.roomId) + ':room';

    // Handle first time user joined specially
    if (data.eventName === AnalyticsEvents.ANALYTICS_EVENT_USER_JOINED) {
      await this.handleFirstTimeUserJoined(data, key);
    } else {
      await this.insertEventData(data, key);
    }
  }

  /**
   * Handle user-level analytics events
   * Matches Go: AnalyticsModel.handleUserTypeEvents()
   */
  private async handleUserTypeEvents(data: AnalyticsDataMsg) {
    if (data.eventName === AnalyticsEvents.ANALYTICS_EVENT_UNKNOWN) {
      return;
    }

    const key = ANALYTICS_USER_KEY
      .replace('%s', data.roomId)
      .replace('%s', data.userId || '');

    await this.insertEventData(data, key);
  }

  /**
   * Handle first time user joined
   * Matches Go: AnalyticsModel.handleFirstTimeUserJoined()
   */
  private async handleFirstTimeUserJoined(data: AnalyticsDataMsg, key: string) {
    let userMeta: any = {};

    // Parse user metadata from extraData
    if (data.extraData) {
      try {
        userMeta = JSON.parse(data.extraData);
      } catch (e) {
        this.logger.warn('Failed to parse user metadata for analytics');
      }
    }

    const userInfo = create(AnalyticsRedisUserInfoSchema, {
      name: data.userName,
      isAdmin: userMeta.is_admin || false,
      exUserId: userMeta.ex_user_id,
    });

    const userInfoJson = toJson(AnalyticsRedisUserInfoSchema, userInfo);
    const usersMap = {
      [data.userId || '']: JSON.stringify(userInfoJson),
    };

    // Store user info
    const usersKey = `${key}:users`;
    const redis = this.redisService.getClient();
    try {
      await redis.hset(usersKey, usersMap);
    } catch (err) {
      this.logger.error(`Failed to add analytics user: ${err.message}`);
    }

    // Also insert user_joined event
    const userEventKey = ANALYTICS_USER_KEY
      .replace('%s', data.roomId)
      .replace('%s', data.userId || '');
    await this.insertEventData(data, userEventKey);
  }

  /**
   * Insert event data into Redis
   * Matches Go: AnalyticsModel.insertEventData()
   */
  private async insertEventData(data: AnalyticsDataMsg, key: string) {
    const redis = this.redisService.getClient();
    const eventKey = `${key}:${AnalyticsEvents[data.eventName]}`;

    try {
      if (data.eventValueInteger !== undefined && data.eventValueInteger !== null) {
        // INCRBY for integer values
        await redis.incrby(eventKey, Number(data.eventValueInteger));

      } else if (data.eventValueString !== undefined && data.eventValueString !== null) {
        // SET for string values
        await redis.set(eventKey, data.eventValueString);

      } else {
        // HSET for timestamped events
        const fieldName = data.time?.toString() || Date.now().toString();
        const fieldValue = data.hsetValue || fieldName;
        await redis.hset(eventKey, fieldName, fieldValue);
      }
    } catch (err) {
      this.logger.error(`Failed to insert analytics event: ${err.message}`);
    }
  }

  /**
   * Export analytics data when room ends
   * Matches Go: Export analytics to JSON file
   */
  async exportAnalytics(roomId: string, roomTableId: bigint) {
    try {
      const redis = this.redisService.getClient();
      const pattern = ANALYTICS_ROOM_KEY.replace('%s', roomId) + '*';

      // Get all keys for this room
      const keys = await redis.keys(pattern);
      if (keys.length === 0) {
        this.logger.debug(`No analytics data found for room ${roomId}`);
        return;
      }

      // Collect all data
      const analyticsData: any = {
        room_id: roomId,
        exported_at: new Date().toISOString(),
        data: {},
      };

      for (const key of keys) {
        const type = await redis.type(key);
        const keyName = key.replace(ANALYTICS_ROOM_KEY.replace('%s', roomId) + ':', '');

        if (type === 'hash') {
          analyticsData.data[keyName] = await redis.hgetall(key);
        } else if (type === 'string') {
          analyticsData.data[keyName] = await redis.get(key);
        } else {
          this.logger.warn(`Unknown Redis type ${type} for key ${key}`);
        }
      }

      // Save to file
      const analyticsDir = this.configService.get('analytics.storagePath', './analytics');
      await fs.mkdir(analyticsDir, { recursive: true });

      const fileName = `analytics_${roomId}_${Date.now()}.json`;
      const filePath = path.join(analyticsDir, fileName);
      const fileContent = JSON.stringify(analyticsData, null, 2);

      await fs.writeFile(filePath, fileContent, 'utf-8');
      const stats = await fs.stat(filePath);

      // Get room info for creation time
      const roomInfo = await this.prisma.roomInfo.findFirst({
        where: { id: Number(roomTableId) },
      });

      // Save metadata to database
      await this.prisma.roomAnalytics.create({
        data: {
          roomTableId: Number(roomTableId),
          roomId,
          fileId: `analytics_${roomId}_${Date.now()}`,
          fileName,
          fileSize: stats.size,
          roomCreationTime: roomInfo?.creationTime || 0,  // Int type, not BigInt
          creationTime: Date.now(),  // Int type, not BigInt
        },
      });

      // Clean up Redis data
      await redis.del(...keys);

      this.logger.log(`Analytics exported for room ${roomId}: ${fileName}`);
    } catch (err) {
      this.logger.error(`Failed to export analytics for room ${roomId}: ${err.message}`);
    }
  }

  /**
   * Fetch analytics list
   * Matches Go: AnalyticsModel.FetchAnalytics()
   */
  async fetchAnalytics(req: FetchAnalyticsReq): Promise<FetchAnalyticsResult> {
    const limit = Math.min(Math.max(req.limit || 20, 1), 100);
    const from = req.from || 0;
    const orderBy = req.orderBy || 'DESC';

    const where: any = {};
    if (req.roomIds && req.roomIds.length > 0) {
      where.roomId = { in: req.roomIds };
    }

    // Get total count
    const total = await this.prisma.roomAnalytics.count({ where });

    // Fetch records
    const records = await this.prisma.roomAnalytics.findMany({
      where,
      take: limit,
      skip: from,
      orderBy: {
        creationTime: orderBy === 'DESC' ? 'desc' : 'asc',
      },
    });

    const analyticsList: AnalyticsInfo[] = records.map(record => create(AnalyticsInfoSchema, {
      roomId: record.roomId,
      fileId: record.fileId,
      fileName: record.fileName,
      fileSize: record.fileSize,
      creationTime: record.creationTime.toString(),
    }));

    return create(FetchAnalyticsResultSchema, {
      totalAnalytics: total.toString(),
      from,
      limit,
      orderBy,
      analyticsList,
    });
  }

  /**
   * Delete analytics file
   */
  async deleteAnalytics(fileId: string): Promise<boolean> {
    try {
      // Use findFirst since fileId is no longer unique
      const record = await this.prisma.roomAnalytics.findFirst({
        where: { fileId },
      });

      if (!record) {
        throw new Error('Analytics record not found');
      }

      // Delete file
      const analyticsDir = this.configService.get('analytics.storagePath', './analytics');
      const filePath = path.join(analyticsDir, record.fileName);

      try {
        await fs.unlink(filePath);
      } catch (err) {
        this.logger.warn(`Failed to delete analytics file: ${err.message}`);
      }

      // Delete DB record  
      await this.prisma.roomAnalytics.deleteMany({
        where: { fileId },
      });

      return true;
    } catch (err) {
      this.logger.error(`Failed to delete analytics: ${err.message}`);
      return false;
    }
  }

  /**
   * Get analytics download token
   */
  async getDownloadToken(fileId: string): Promise<string> {
    // Use findFirst since fileId is no longer unique constraint
    const record = await this.prisma.roomAnalytics.findFirst({
      where: { fileId },
    });

    if (!record) {
      throw new Error('Analytics file not found');
    }

    // Generate token (simple implementation, use JWT in production)
    const token = Buffer.from(JSON.stringify({
      fileId,
      fileName: record.fileName,
      exp: Date.now() + 300000, // 5 minutes
    })).toString('base64');

    return token;
  }

  /**
   * Verify download token and get file path
   */
  async verifyDownloadToken(token: string): Promise<{ fileName: string; filePath: string }> {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

      if (decoded.exp < Date.now()) {
        throw new Error('Token expired');
      }

      const analyticsDir = this.configService.get('analytics.storagePath', './analytics');
      const filePath = path.join(analyticsDir, decoded.fileName);

      // Verify file exists
      await fs.access(filePath);

      return {
        fileName: decoded.fileName,
        filePath,
      };
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }
}
