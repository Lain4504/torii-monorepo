import {
    ActivatePollsReq,
    NatsMsgServerToClientEvents,
    CreatePollReq,
    PollInfo,
    PollInfoSchema,
    SubmitPollResponseReq,
    ClosePollReq,
    PollResponse,
    PollResponseSchema,
    PollResponsesResult,
    PollResponsesResultSchema,
    PollResponsesResultOptionsSchema,
    PollsStatsSchema,
} from "@workspace/protocol";
import { RpcException } from "@nestjs/microservices";
import { RedisService, NatsService } from "@server/shared";
import { RoomService } from "./room.service";
import { v4 as uuidv4 } from "uuid";
import { Injectable, Logger } from "@nestjs/common";
import { create, fromJson, toJsonString } from "@bufbuild/protobuf";
import { Redis } from "ioredis";

const POLLS_KEY = "pnm:polls:";
const POLL_RESPONDENTS_SUB_KEY = ":respondents:";
const POLL_VOTED_USERS_SUB_KEY = ":voted_users";
const POLL_ALL_RES_SUB_KEY = ":all_respondents";
const POLL_TOTAL_RESP_FIELD = "total_resp";
const POLL_COUNT_SUFFIX = "_count";
const EXPIRE_DURATION = 60 * 60 * 24; // 24 hours

@Injectable()
export class PollService {
    private readonly logger = new Logger(PollService.name);
    constructor(
        private readonly redisService: RedisService,
        private readonly roomService: RoomService,
        private readonly natsService: NatsService,
    ) { }

    private getRedisClient(): Redis {
        return this.redisService.getClient();
    }

    private ok(partial: Partial<PollResponse>): PollResponse {
        return create(PollResponseSchema, {
            status: true,
            msg: "success",
            responses: {},
            polls: [],
            ...partial,
        });
    }

    private fail(msg: string, extra?: Partial<PollResponse>): PollResponse {
        return create(PollResponseSchema, {
            status: false,
            msg,
            responses: {},
            polls: [],
            ...extra,
        });
    }

    async createPoll(data: CreatePollReq & { isAdmin?: boolean }): Promise<PollResponse> {
        const pollId = data.pollId || uuidv4();
        const { roomId, userId } = data;

        if (!data.isAdmin) return this.fail("only admin can perform this task");
        if (!roomId) return this.fail("roomId required");
        if (!userId) return this.fail("userId required");
        const question = data.question ?? "";
        const options = (data.options ?? []).map((o) => ({ id: o.id, text: o.text }));

        try {
            const pollInfo = create(PollInfoSchema, {
                id: pollId,
                roomId,
                question,
                options,
                isRunning: true,
                createdBy: userId,
                created: String(Math.floor(Date.now() / 1000)),
                closedBy: "",
            });

            const key = `${POLLS_KEY}${roomId}`;
            const pollInfoJson = toJsonString(PollInfoSchema, pollInfo);

            const pipeline = this.getRedisClient().pipeline();
            pipeline.hset(key, pollId, pollInfoJson);
            pipeline.expire(key, EXPIRE_DURATION);
            await pipeline.exec();

            // Broadcast POLL_CREATED (public channel, matches Go behaviour – initiator will also see it)
            await this.roomService.broadcastNatsEvent(
                NatsMsgServerToClientEvents.POLL_CREATED,
                roomId,
                pollId,
            );

            return this.ok({ pollId });
        } catch (error: any) {
            this.logger.error(`Error creating poll: ${error.message}`);
            return this.fail(error.message);
        }
    }

    async listPolls(data: { roomId: string }): Promise<PollResponse> {
        if (!data.roomId) return this.fail("roomId required");
        try {
            const key = `${POLLS_KEY}${data.roomId}`;
            const pollsMap = await this.redisService.hgetall(key);
            const polls: PollInfo[] = pollsMap
                ? Object.values(pollsMap).map((p) => {
                    const parsed = fromJson(PollInfoSchema, JSON.parse(p));
                    if (!parsed.question) parsed.question = "";
                    if (!parsed.options) parsed.options = [];
                    return parsed;
                })
                : [];

            polls.sort((a, b) => Number(b.created) - Number(a.created));

            return this.ok({ polls });
        } catch (error: any) {
            this.logger.error(`Error listing polls: ${error.message}`);
            return this.fail(error.message);
        }
    }

    async closePoll(data: ClosePollReq & { isAdmin?: boolean }): Promise<PollResponse> {
        if (!data.isAdmin) return this.fail("only admin can perform this task");
        if (!data.roomId) return this.fail("roomId required");
        if (!data.pollId) return this.fail("pollId required");
        if (!data.userId) return this.fail("userId required");

        try {
            const key = `${POLLS_KEY}${data.roomId}`;
            const pollJson = await this.redisService.hget(key, data.pollId);

            if (!pollJson) {
                return this.fail("Poll not found");
            }

            const poll = fromJson(PollInfoSchema, JSON.parse(pollJson));
            if (!poll.options) poll.options = [];
            poll.isRunning = false;
            poll.closedBy = data.userId;

            const updatedPollJson = toJsonString(PollInfoSchema, poll);
            await this.redisService.hset(key, data.pollId, updatedPollJson);

            await this.roomService.broadcastNatsEvent(
                NatsMsgServerToClientEvents.POLL_CLOSED,
                data.roomId,
                data.pollId,
            );

            return this.ok({ pollId: data.pollId });
        } catch (error: any) {
            this.logger.error(`Error closing poll: ${error.message}`);
            return this.fail(error.message);
        }
    }

    async submitPollResponse(data: SubmitPollResponseReq): Promise<PollResponse> {
        if (!data.roomId) return this.fail("roomId required");
        if (!data.pollId) return this.fail("pollId required");
        if (!data.userId) return this.fail("userId required");

        try {
            const respondentsKey = `${POLLS_KEY}${data.roomId}${POLL_RESPONDENTS_SUB_KEY}${data.pollId}`;
            const votedUsersKey = `${respondentsKey}${POLL_VOTED_USERS_SUB_KEY}`;
            const allRespondentsKey = `${respondentsKey}${POLL_ALL_RES_SUB_KEY}`;

            const redis = this.getRedisClient();

            await redis.watch(votedUsersKey);

            const isMember = await redis.sismember(votedUsersKey, data.userId);
            if (isMember === 1) {
                await redis.unwatch();
                return this.fail("user already voted", { pollId: data.pollId });
            }

            const voteData = `${data.userId}:${data.selectedOption}:${data.name}`;

            const multi = redis.multi();
            multi.sadd(votedUsersKey, data.userId);
            multi.expire(votedUsersKey, EXPIRE_DURATION);
            multi.rpush(allRespondentsKey, voteData);
            multi.expire(allRespondentsKey, EXPIRE_DURATION);
            multi.hincrby(respondentsKey, POLL_TOTAL_RESP_FIELD, 1);
            multi.hincrby(respondentsKey, `${data.selectedOption}${POLL_COUNT_SUFFIX}`, 1);
            multi.expire(respondentsKey, EXPIRE_DURATION);

            const results = await multi.exec();
            if (!results) {
                return this.fail("Failed to submit vote (transaction aborted)", { pollId: data.pollId });
            }

            return this.ok({ pollId: data.pollId });
        } catch (error: any) {
            this.logger.error(`Error submitting vote: ${error.message}`);
            return this.fail(error.message, { pollId: data.pollId });
        }
    }

    async getPollStats(data: { roomId: string }): Promise<PollResponse> {
        if (!data.roomId) return this.fail("roomId required");
        try {
            const key = `${POLLS_KEY}${data.roomId}`;
            const pollsMap = await this.redisService.hgetall(key);

            let totalPolls = 0;
            let totalRunning = 0;

            if (pollsMap) {
                const polls = Object.values(pollsMap);
                totalPolls = polls.length;
                for (const p of polls) {
                    const info = fromJson(PollInfoSchema, JSON.parse(p));
                    if (info.isRunning) totalRunning++;
                }
            }

            const stats = create(PollsStatsSchema, {
                totalPolls: String(totalPolls),
                totalRunning: String(totalRunning),
            });

            return this.ok({ stats });
        } catch (error: any) {
            this.logger.error(`Error getting poll stats: ${error.message}`);
            return this.fail(error.message);
        }
    }

    /**
     * Activate/deactivate polls for a room
     * Matches Go server: PollModel.ManageActivation()
     */
    async activatePolls(data: ActivatePollsReq & { isAdmin?: boolean }): Promise<PollResponse> {
        this.logger.log(`[activatePolls] Called with roomId: ${data.roomId}, isActive: ${data.isActive}`);

        if (!data.isAdmin) return this.fail("only admin can perform this task");
        if (!data.roomId) return this.fail("roomId required");

        const roomMeta = await this.natsService.getRoomMetadataStruct(data.roomId);
        if (!roomMeta) {
            this.logger.error(`[activatePolls] Invalid nil room metadata for ${data.roomId}`);
            return this.fail("invalid nil room metadata information");
        }

        if (!roomMeta.roomFeatures) {
            if (roomMeta.room_features) {
                roomMeta.roomFeatures = roomMeta.room_features;
            } else {
                return this.fail("room features not found");
            }
        }

        if (!roomMeta.roomFeatures.pollsFeatures) {
            if (roomMeta.roomFeatures.polls_features) {
                roomMeta.roomFeatures.pollsFeatures = roomMeta.roomFeatures.polls_features;
            } else {
                return this.fail("polls features not found");
            }
        }

        roomMeta.roomFeatures.pollsFeatures.isActive = data.isActive;
        await this.roomService.updateAndBroadcastRoomMetadata(data.roomId, roomMeta);

        this.logger.log(`[activatePolls] Successfully updated isActive=${data.isActive} for room ${data.roomId}`);

        return this.ok({});
    }

    async countPollTotalResponses(data: { roomId: string; pollId: string }): Promise<PollResponse> {
        if (!data.roomId) return this.fail("roomId required");
        if (!data.pollId) return this.fail("pollId required");
        try {
            const respondentsKey = `${POLLS_KEY}${data.roomId}${POLL_RESPONDENTS_SUB_KEY}${data.pollId}`;
            const total = await this.redisService.hget(respondentsKey, POLL_TOTAL_RESP_FIELD);

            return this.ok({ pollId: data.pollId, totalResponses: total || "0" });
        } catch (error: any) {
            this.logger.error(`Error counting total responses: ${error.message}`);
            return this.fail(error.message, { pollId: data.pollId });
        }
    }

    async userSelectedOption(data: {
        roomId: string;
        pollId: string;
        userId: string;
    }): Promise<PollResponse> {
        if (!data.roomId) return this.fail("roomId required");
        if (!data.pollId || !data.userId) return this.fail("both userId & pollId required");
        try {
            const respondentsKey = `${POLLS_KEY}${data.roomId}${POLL_RESPONDENTS_SUB_KEY}${data.pollId}`;
            const allRespondentsKey = `${respondentsKey}${POLL_ALL_RES_SUB_KEY}`;

            const allRespondents = await this.getRedisClient().lrange(allRespondentsKey, 0, -1);

            let votedOption = "0";

            if (allRespondents && allRespondents.length > 0) {
                for (const item of allRespondents) {
                    const parts = item.split(":");
                    if (parts[0] === data.userId) {
                        votedOption = parts[1];
                        break;
                    }
                }
            }

            if (votedOption === "0") {
                return this.ok({ pollId: data.pollId, voted: "0", msg: "not voted" });
            }

            return this.ok({ pollId: data.pollId, voted: votedOption });
        } catch (error: any) {
            this.logger.error(`Error checking user selection: ${error.message}`);
            return this.fail(error.message, { pollId: data.pollId });
        }
    }

    async getPollResponsesDetails(data: { roomId: string; pollId: string; isAdmin?: boolean }): Promise<PollResponse> {
        if (!data.isAdmin) return this.fail("only admin can perform this task");
        if (!data.roomId) return this.fail("roomId required");
        if (!data.pollId) return this.fail("pollId required");
        try {
            const respondentsKey = `${POLLS_KEY}${data.roomId}${POLL_RESPONDENTS_SUB_KEY}${data.pollId}`;
            const allRespondentsKey = `${respondentsKey}${POLL_ALL_RES_SUB_KEY}`;

            let counters = await this.redisService.hgetall(respondentsKey);
            if (!counters) counters = {};

            const allRespondents = await this.getRedisClient().lrange(allRespondentsKey, 0, -1);

            const result: Record<string, string> = { ...counters };
            result["all_respondents"] = JSON.stringify(allRespondents || []);

            if (!result[POLL_TOTAL_RESP_FIELD]) {
                result[POLL_TOTAL_RESP_FIELD] = "0";
            }

            return this.ok({ pollId: data.pollId, responses: result });
        } catch (error: any) {
            this.logger.error(`Error getting response details: ${error.message}`);
            return this.fail(error.message, { pollId: data.pollId });
        }
    }

    async getResponsesResult(data: { roomId: string; pollId: string }): Promise<PollResponse> {
        if (!data.roomId) return this.fail("roomId required");
        if (!data.pollId) return this.fail("pollId required");
        try {
            const key = `${POLLS_KEY}${data.roomId}`;
            const pollJson = await this.redisService.hget(key, data.pollId);

            if (!pollJson) {
                return this.fail("Poll not found");
            }
            const pollInfo = fromJson(PollInfoSchema, JSON.parse(pollJson));
            if (!pollInfo.options) pollInfo.options = [];

            if (pollInfo.isRunning) {
                return this.fail("need to wait until poll close", { pollId: data.pollId });
            }

            const respondentsKey = `${POLLS_KEY}${data.roomId}${POLL_RESPONDENTS_SUB_KEY}${data.pollId}`;
            const counters = (await this.redisService.hgetall(respondentsKey)) || {};

            const resultOptions = pollInfo.options.map((opt) => {
                const countKey = `${opt.id}${POLL_COUNT_SUFFIX}`;
                const count = counters[countKey] || "0";
                return create(PollResponsesResultOptionsSchema, {
                    id: String(opt.id),
                    text: opt.text,
                    voteCount: count,
                });
            });

            const totalResp = counters[POLL_TOTAL_RESP_FIELD] || "0";

            const pollResponsesResult = create(PollResponsesResultSchema, {
                question: pollInfo.question,
                totalResponses: totalResp,
                options: resultOptions,
            });

            return this.ok({ pollId: data.pollId, pollResponsesResult });
        } catch (error: any) {
            this.logger.error(`Error getting response result: ${error.message}`);
            return this.fail(error.message, { pollId: data.pollId });
        }
    }

    async cleanUpPolls(roomId: string): Promise<void> {
        const key = `${POLLS_KEY}${roomId}`;
        const pollIds = await this.getRedisClient().hkeys(key);
        if (!pollIds || pollIds.length === 0) return;

        const pp = this.getRedisClient().pipeline();
        for (const id of pollIds) {
            const respondentsKey = `${POLLS_KEY}${roomId}${POLL_RESPONDENTS_SUB_KEY}${id}`;
            const votedUsersKey = `${respondentsKey}${POLL_VOTED_USERS_SUB_KEY}`;
            const allRespondentsKey = `${respondentsKey}${POLL_ALL_RES_SUB_KEY}`;
            pp.del(respondentsKey);
            pp.del(votedUsersKey);
            pp.del(allRespondentsKey);
        }
        pp.del(key);
        await pp.exec();
    }
}