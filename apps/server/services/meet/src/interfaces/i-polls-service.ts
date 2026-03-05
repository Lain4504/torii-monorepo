import {
  ActivatePollsReq,
  ClosePollReq,
  CreatePollReq,
  PollInfo,
  PollResponsesResult,
  PollsStats,
  SubmitPollResponseReq,
} from '@workspace/protocol';

export interface IPollsService {
  /**
   * manageActivation activates or deactivates the polls feature in a room
   * @param req
   */
  manageActivation(req: ActivatePollsReq): Promise<void>;

  /**
   * createPoll creates a new poll in the room and returns the poll ID
   * @param r
   */
  createPoll(r: CreatePollReq): Promise<string>;

  /**
   * userSubmitResponse allows a user to submit their response to a poll
   * @param r
   */
  userSubmitResponse(r: SubmitPollResponseReq): Promise<void>;

  /**
   * closePoll closes an active poll, preventing further responses
   * @param r
   */
  closePoll(r: ClosePollReq): Promise<void>;

  /**
   * cleanUpPolls removes all poll data for a room, typically called when a room ends
   * @param roomId
   */
  cleanUpPolls(roomId: string): Promise<void>;

  /**
   * listPolls retrieves all polls for a room, including their status and responses
   * @param roomId
   */
  listPolls(roomId: string): Promise<PollInfo[]>;

  /**
   * userSelectedOption retrieves the option selected by a user for a specific poll
   * @param roomId
   * @param pollId
   * @param userId
   */
  userSelectedOption(
    roomId: string,
    pollId: string,
    userId: string,
  ): Promise<string>;

  /**
   * getPollResponsesDetails retrieves detailed response information for a poll, such as which users selected which options
   * @param roomId
   * @param pollId
   */
  getPollResponsesDetails(
    roomId: string,
    pollId: string,
  ): Promise<Record<string, string>>;

  /**
   * getResponsesResult retrieves aggregated results for a poll, such as total votes per option
   * @param roomId
   * @param pollId
   */
  getResponsesResult(
    roomId: string,
    pollId: string,
  ): Promise<PollResponsesResult>;

  /**
   * getPollsStats retrieves overall statistics for polls in a room, such as total number of polls created, active polls, and total responses
   * @param roomId
   */
  getPollsStats(roomId: string): Promise<PollsStats>;

  /**
   * getPollTotalResponses retrieves the total number of responses submitted for a specific poll
   * @param roomId
   * @param pollId
   */
  getPollTotalResponses(roomId: string, pollId: string): Promise<string>;
}
