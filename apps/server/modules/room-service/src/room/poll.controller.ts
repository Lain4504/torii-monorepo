import { MessagePattern, Payload } from "@nestjs/microservices";
import type { ActivatePollsReq, CreatePollReq, SubmitPollResponseReq, ClosePollReq } from "@workspace/protocol";
import { Controller } from "@nestjs/common";
import { PollService } from "./poll.service";
@Controller()
export class PollController {

    constructor(
        private readonly pollService: PollService,
    ) { }
    @MessagePattern({ cmd: 'poll.activate' })
    async activatePolls(@Payload() data: ActivatePollsReq) {
        return this.pollService.activatePolls(data);
    }

    @MessagePattern({ cmd: 'poll.list' })
    async listPollsMsg(@Payload() data: { roomId: string }) {
        return this.pollService.listPolls(data);
    }

    @MessagePattern({ cmd: 'poll.stats' })
    async getPollStatsMsg(@Payload() data: { roomId: string; pollId: string }) {
        return this.pollService.getPollStats(data);
    }

    @MessagePattern({ cmd: 'poll.countResponses' })
    async countPollTotalResponses(@Payload() data: { roomId: string; pollId: string }) {
        return this.pollService.countPollTotalResponses(data);
    }

    @MessagePattern({ cmd: 'poll.userOption' })
    async userSelectedOption(@Payload() data: { roomId: string; pollId: string; userId: string }) {
        return this.pollService.userSelectedOption(data);
    }

    @MessagePattern({ cmd: 'poll.responsesDetails' })
    async getPollResponsesDetails(@Payload() data: { roomId: string; pollId: string }) {
        return this.pollService.getPollResponsesDetails(data);
    }

    @MessagePattern({ cmd: 'poll.responsesResult' })
    async getResponsesResult(@Payload() data: { roomId: string; pollId: string }) {
        return this.pollService.getResponsesResult(data);
    }

    @MessagePattern({ cmd: 'poll.create' })
    async createPoll(@Payload() data: CreatePollReq) {
        return this.pollService.createPoll(data);
    }

    @MessagePattern({ cmd: 'poll.close' })
    async closePoll(@Payload() data: ClosePollReq) {
        return this.pollService.closePoll(data);
    }

    @MessagePattern({ cmd: 'poll.submit' })
    async submitPoll(@Payload() data: SubmitPollResponseReq) {
        return this.pollService.submitPollResponse(data);
    }
}