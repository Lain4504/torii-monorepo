import { Room } from 'livekit-server-sdk';
import {
  ActiveRoomInfo,
  ActiveRoomWithParticipant,
  ApproveWaitingUsersReq,
  BreakoutRoom,
  BroadcastBreakoutRoomMsgReq,
  ChangeVisibilityRes,
  CreateBreakoutRoomsReq,
  CreateRoomReq,
  EndBreakoutRoomReq,
  FetchPastRoomsReq,
  FetchPastRoomsResult,
  GetActiveRoomInfoReq,
  IncreaseBreakoutRoomDurationReq,
  IsRoomActiveReq,
  IsRoomActiveRes,
  JoinBreakoutRoomReq,
  NatsKvRoomInfo,
  RoomEndReq,
  RoomMetadata,
  SwitchPresenterTask,
  UpdateWaitingRoomMessageReq,
} from '@workspace/protocol';
import { RoomDurationInfo } from '@server/meet/modules/room/room-duration.service';

export interface IRoomService {
  /**
   * Create a meet room
   * @param req
   */
  createRoom(req: CreateRoomReq): Promise<ActiveRoomInfo>;

  /**
   * endRoom terminates a room session
   *
   * Steps:
   * 1. Wait for room creation lock
   * 2. Get room from DB
   * 3. Get room from NATS
   * 4. Cache temporary data in Redis
   * 5. Broadcast SESSION_ENDED event
   * 6. Trigger async cleanup
   *
   * @param req - RoomEndReq request
   * @returns { status: boolean, msg: string }
   */
  endRoom(req: RoomEndReq): Promise<{ status: boolean; msg: string }>;

  /**
   * Is Room Active
   * @param req
   */
  isRoomActive(req: IsRoomActiveReq): Promise<{
    res: IsRoomActiveRes;
    roomDbInfo: any | null;
    rInfo: NatsKvRoomInfo | null;
    metadata: RoomMetadata | null;
    meta?: RoomMetadata | null;
  }>;

  /**
   * GetActiveRoomInfo gets detailed info about an active room
   *
   * @returns [success, message, roomWithParticipants]
   */
  getActiveRoomInfo(req: GetActiveRoomInfoReq): Promise<{
    status: boolean;
    msg: string;
    room: ActiveRoomWithParticipant | null;
  }>;

  /**
   * GetActiveRoomsInfo gets all active rooms with participants
   *
   * @returns [success, message, rooms]
   */
  getActiveRoomsInfo(): Promise<{
    status: boolean;
    msg: string;
    rooms: ActiveRoomWithParticipant[] | null;
  }>;

  /**
   * FetchPastRooms fetches historical room records with pagination
   */
  fetchPastRooms(req: FetchPastRoomsReq): Promise<FetchPastRoomsResult>;

  /**
   * Get room info by roomId from database
   *
   * Made public for use by RoomEndService
   */
  getRoomInfoByRoomId(roomId: string, isRunning: boolean): Promise<any | null>;

  /**
   * Get room info by sid (LiveKit session ID) from database
   *
   * Made public for use by controllers
   */
  getRoomInfoBySid(sid: string, isRunning?: number): Promise<any | null>;

  /**
     * Update room status in database

     *
     * Made public for use by RoomEndService
     */
  updateRoomStatus(roomId: string, isRunning: boolean): Promise<void>;

  /**
   * insertOrUpdateRoomInfo inserts or updates room info
   *
   * Will insert if sid doesn't exist, otherwise update if ID is provided
   * Returns the full room object with ID
   *
   * @param info - Room info to save
   * @returns Full room object with auto-increment ID
   */
  insertOrUpdateRoomInfo(info: {
    id?: bigint;
    roomTitle: string;
    roomId: string;
    sid: string;
    joinedParticipants?: number;
    isRunning?: number;
    isRecording?: number;
    isActiveRtmp?: number;
    webhookUrl?: string;
    isBreakoutRoom?: boolean;
    parentRoomId?: string;
    creationTime?: bigint;
    created?: Date;
    modified?: Date;
    ended?: Date;
    recorderId?: string;
    rtmpNodeId?: string;
  }): Promise<any>;

  /**
   * updateRoomRecordingStatus updates the recording status of a room
   *
   * @param roomTableId - Room table ID
   * @param isRecording - Recording status (0 or 1)
   * @param recorderId - Optional recorder ID
   * @returns Number of rows affected
   */
  updateRoomRecordingStatus(
    roomTableId: bigint,
    isRecording: number,
    recorderId?: string | null,
  ): Promise<number>;

  /**
   * updateRoomRTMPStatus updates the RTMP status of a room
   *
   * @param roomTableId - Room table ID
   * @param isActiveRtmp - RTMP active status (0 or 1)
   * @param rtmpNodeId - Optional RTMP node ID
   * @returns Number of rows affected
   */
  updateRoomRTMPStatus(
    roomTableId: bigint,
    isActiveRtmp: number,
    rtmpNodeId?: string | null,
  ): Promise<number>;

  /**
   * UpdateNumParticipants sets the participant count to a specific number
   *
   * @param roomSid - Room SID from LiveKit
   * @param num - New participant count
   * @returns Number of rows affected
   */
  updateNumParticipants(roomSid: string, num: number): Promise<number>;

  /**
   * incrementOrDecrementNumParticipants increments or decrements participant count
   *
   * Uses raw SQL for atomic operation with GREATEST to prevent negative values
   *
   * @param roomSid - Room SID from LiveKit
   * * @param operator - "+" to increment, "-" to decrement
   * @returns Number of rows affected
   */
  incrementOrDecrementNumParticipants(
    roomSid: string,
    operator: '+' | '-',
  ): Promise<number>;

  /**
   * addRoomWithDurationInfo adds room with duration info to tracking
   *
   * @param roomId - Room ID
   * @param info - Duration information
   */
  addRoomWithDurationInfo(roomId: string, r: RoomDurationInfo): Promise<void>;

  /**
     * DeleteRoomWithDuration removes room from duration tracking

     *
     * @param roomId - Room ID to remove
     */
  deleteRoomWithDuration(roomId: string): Promise<void>;

  /**
   * GetRoomsWithDurationMap retrieves all rooms with duration info
   * @returns Map of roomId to RoomDurationInfo
   */
  getRoomsWithDurationMap(): Promise<Record<string, RoomDurationInfo>>;

  /**
   * GetRoomDurationInfo retrieves duration info for a room
   * Used by IncreaseRoomDuration and CompareDurationWithParentRoom
   *
   * @param roomId - Room ID
   * @returns RoomDurationInfo or null if not found
   */
  getRoomDurationInfo(roomId: string): Promise<RoomDurationInfo | null>;

  /**
     * IncreaseRoomDuration increases the duration limit for a room

     *
     * Complex logic:
     * 1. Get current room duration info from Redis
     * 2. Get room metadata from NATS
     * 3. Check if breakout room - validate against parent room duration
     * 4. Update duration in Redis
     * 5. Update and broadcast room metadata via NATS
     * 6. Rollback Redis on metadata update failure
     *
     * @param roomId - Room ID
     * @param duration - Duration to add (in minutes)
     * @returns New total duration
     */
  increaseRoomDuration(roomId: string, duration: number): Promise<number>;

  /**
     * CompareDurationWithParentRoom validates breakout room duration against parent

     *
     * Ensures breakout room duration doesn't exceed parent room's remaining time
     *
     * @param mainRoomId - Parent room ID
     * @param duration - Proposed duration for breakout room (minutes)
     */
  compareDurationWithParentRoom(
    mainRoomId: string,
    duration: number,
  ): Promise<void>;

  /**
   * ChangeVisibility updates visibility of whiteboard and/or notepad
   *
   * @param req - ChangeVisibilityRes request
   * @returns { status: boolean, msg: string }
   */
  changeVisibility(
    req: ChangeVisibilityRes,
  ): Promise<{ status: boolean; msg: string }>;

  /**
   * approveWaitingUsers approves one or all users from the waiting room
   *
   * @param req - Approval request containing roomId and userId (or "all")
   */
  approveWaitingUsers(req: ApproveWaitingUsersReq): Promise<void>;

  /**
   * updateWaitingRoomMessage updates the waiting room message for a room
   *
   * @param req - Request containing roomId and new message
   */
  updateWaitingRoomMessage(req: UpdateWaitingRoomMessageReq): Promise<void>;

  /**
   * CreateBreakoutRooms creates multiple breakout rooms under a parent room
   */
  createBreakoutRooms(req: CreateBreakoutRoomsReq): Promise<void>;

  /**
   * JoinBreakoutRoom validates and generates token for joining a breakout room
   */
  joinBreakoutRoom(req: JoinBreakoutRoomReq): Promise<string>;

  /**
   * EndBreakoutRoom ends a specific breakout room via RoomEndService
   */
  endBreakoutRoom(req: EndBreakoutRoomReq): Promise<void>;

  /**
   * EndAllBreakoutRooms ends all sub-rooms for a parent room
   */
  endAllBreakoutRooms(parentRoomId: string): Promise<void>;

  /**
   * GetBreakoutRoomsInfo returns list of breakout rooms
   */
  getBreakoutRoomsInfo(roomId: string): Promise<BreakoutRoom[]>;

  /**
   * GetMyBreakoutRoom gets the breakout room a user belongs to
   */
  getMyBreakoutRoom(
    roomId: string,
    userId: string,
  ): Promise<BreakoutRoom | undefined>;

  /**
   * IncreaseBreakoutRoomDuration extends duration
   */
  increaseBreakoutRoomDuration(
    req: IncreaseBreakoutRoomDurationReq,
  ): Promise<void>;

  /**
   * BroadcastBreakoutRoomMsg sends a system message to all breakout rooms
   */
  broadcastBreakoutRoomMsg(req: BroadcastBreakoutRoomMsgReq): Promise<void>;

  /**
   * PostTaskAfterRoomStartWebhook handles post-start updates (setting created time, etc.)
   */
  postTaskAfterRoomStartWebhook(
    roomId: string,
    metadata: RoomMetadata,
  ): Promise<void>;

  /**
   * PostTaskAfterRoomEndWebhook handles cleanup when a room ends
   */
  postTaskAfterRoomEndWebhook(roomId: string, metadata: string): Promise<void>;
}
