export class SaveFileMetadataDto {
    fileId: string;
    roomId: string;
    userId: string;
    filePath: string;
    fileType: string;
    mimeType: string;
    fileSize?: number;
}

export class CreatePollDto {
    roomId: string;
    userId: string;
    question: string;
    options: any[];
}

export class ClosePollDto {
    roomId: string;
    pollId: string;
    userId: string;
}

export class SubmitPollDto {
    roomId: string;
    pollId: string;
    userId: string;
    name: string;
    selectedOption: number;
}

export class GetPollStatsDto {
    roomId: string;
    pollId: string;
}

export class ListPollsDto {
    roomId: string;
}

export class CreateRoomDto {
    roomName: string;
    emptyTimeout?: number;
    maxParticipants?: number;
    metadata?: any;
}

export class RoomNameDto {
    roomName: string;
}

export class StartRecordingDto {
    roomName: string;
}

export class StopRecordingDto {
    roomName: string;
}

export class FetchRecordingsDto {
    roomIds?: string[];
    from?: number;
    limit?: number;
    orderBy?: 'ASC' | 'DESC';
}

export class DeleteRecordingDto {
    recordId: string;
}

export class GetDownloadTokenDto {
    recordId: string;
}

export class VerifyDownloadTokenDto {
    token: string;
}

export class SendSystemChatMessageDto {
    roomId: string;
    msg: string;
}

export class CreateIngressDto {
    roomId: string;
    inputType: number; // 0: RTMP_INPUT, 1: WHIP_INPUT
    participantName: string;
    url?: string;
    streamKey?: string;
}

export class ApproveWaitingUsersDto {
    roomId: string;
    userId: string; // 'all' or specific userId
}

export class UpdateWaitingRoomMessageDto {
    roomId: string;
    msg: string;
}

export class BreakoutRoomUserDto {
    id: string;
    name?: string;
}

export class CreateBreakoutRoomReqDto {
    id: string;
    title: string;
    users: BreakoutRoomUserDto[];
}

export class CreateBreakoutRoomsDto {
    roomId: string;
    duration: number; // minutes
    welcomeMsg?: string;
    rooms: CreateBreakoutRoomReqDto[];
}

export class JoinBreakoutRoomDto {
    roomId: string; // Parent Room
    breakoutRoomId: string;
    userId: string;
    isAdmin?: boolean;
}

export class EndBreakoutRoomDto {
    roomId: string; // Parent Room
    breakoutRoomId: string;
}
