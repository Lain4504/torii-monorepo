# plugNmeet-server API Verification Checklist

This checklist contains all the API endpoints defined in the original Go implementation of `plugNmeet-server` (`pkg/routers/app_routers.go`). 
Use this to verify if the NestJS implementation in `torii-monorepo` matches the logic and behavior of the original Go server.

## Base Routes
- [ ] `GET /` - Render index
- [ ] `GET /login*` - Render login
- [x] `POST /webhook` - `HandleWebhook` ✅ **VERIFIED**
- [ ] `GET /download/uploadedFile/:sid/*` - `HandleDownloadUploadedFile` (Note: Checked in File Management as well) ✅ **VERIFIED**
- [x] `GET /download/recording/:token` - `HandleDownloadRecording` ✅ **VERIFIED**
- [ ] `GET /download/analytics/:token` - `HandleDownloadAnalytics`
- [x] `GET /download/artifact/:token` - `HandleDownloadArtifact` ✅ **VERIFIED**
- [x] `GET /healthCheck` - `HandleHealthCheck` ✅ **VERIFIED** (Handled in Gateway base)

## LTI Routes (Prefix: `/lti`)
- [ ] `GET /lti/v1` - `HandleLTIV1GETREQUEST`
- [ ] `POST /lti/v1` - `HandleLTIV1Landing`
### LTI API (Prefix: `/lti/v1/api`, Middleware: `HandleLTIV1VerifyHeaderToken`)
- [ ] `POST /lti/v1/api/room/join` - `HandleLTIV1JoinRoom`
- [ ] `POST /lti/v1/api/room/isActive` - `HandleLTIV1IsRoomActive`
- [ ] `POST /lti/v1/api/room/end` - `HandleLTIV1EndRoom`
- [ ] `POST /lti/v1/api/recording/fetch` - `HandleLTIV1FetchRecordings`
- [ ] `POST /lti/v1/api/recording/download` - `HandleLTIV1GetRecordingDownloadToken`
- [ ] `POST /lti/v1/api/recording/delete` - `HandleLTIV1DeleteRecordings`

## Auth Routes (Prefix: `/auth`, Middleware: `HandleAuthHeaderCheck`)
- [ ] `POST /auth/getClientFiles` - `HandleGetClientFiles`
### Room
- [x] `POST /auth/room/create` - `HandleRoomCreate` ✅ **VERIFIED**
- [x] `POST /auth/room/getJoinToken` - `HandleGenerateJoinToken` ✅ **VERIFIED**
- [x] `POST /auth/room/isRoomActive` - `HandleIsRoomActive` ✅ **VERIFIED**
- [x] `POST /auth/room/getActiveRoomInfo` - `HandleGetActiveRoomInfo` ✅ **VERIFIED**
- [x] `POST /auth/room/getActiveRoomsInfo` - `HandleGetActiveRoomsInfo` ✅ **VERIFIED**
- [x] `POST /auth/room/endRoom` - `HandleEndRoom` ✅ **VERIFIED**
- [x] `POST /auth/room/fetchPastRooms` - `HandleFetchPastRooms` ✅ **VERIFIED**
### Recording
- [x] `POST /auth/recording/fetch` - `HandleFetchRecordings` ✅ **VERIFIED**
- [x] `POST /auth/recording/info` - `HandleRecordingInfo` ✅ **VERIFIED**
- [x] `POST /auth/recording/updateMetadata` - `HandleUpdateRecordingMetadata` ✅ **VERIFIED**
- [x] `POST /auth/recording/delete` - `HandleDeleteRecording` ✅ **VERIFIED**
- [x] `POST /auth/recording/getDownloadToken` - `HandleGetDownloadToken` ✅ **VERIFIED**
- [x] `POST /auth/recording/recordingInfo` - `HandleRecordingInfo` (Deprecated, same as `/info`) ✅ **VERIFIED**
### Analytics
- [ ] `POST /auth/analytics/fetch` - `HandleFetchAnalytics` (SKIPPED - Not Implemented in Gateway/Service)
- [ ] `POST /auth/analytics/delete` - `HandleDeleteAnalytics` (SKIPPED - Not Implemented in Gateway/Service)
- [ ] `POST /auth/analytics/getDownloadToken` - `HandleGetAnalyticsDownloadToken` (SKIPPED - Not Implemented in Gateway/Service)
### Artifact
- [x] `POST /auth/artifact/fetch` - `HandleFetchArtifacts` ✅ **VERIFIED**
- [x] `POST /auth/artifact/info` - `HandleGetArtifactInfo` ✅ **VERIFIED**
- [x] `POST /auth/artifact/delete` - `HandleDeleteArtifact` ✅ **VERIFIED**
- [x] `POST /auth/artifact/getDownloadToken` - `HandleGetArtifactDownloadToken` ✅ **VERIFIED**
### Recorder
- [ ] `POST /auth/recorder/notify` - `HandleRecorderEvents` (MISSING - HTTP endpoint not found in Gateway, but NATS handler `recorder.notify` exists in Service)

## BBB Routes (Prefix: `/:apiKey/bigbluebutton/api`, Middleware: `HandleVerifyApiRequest`)
- [ ] `ALL /create` - `HandleBBBCreate`
- [ ] `ALL /join` - `HandleBBBJoin`
- [ ] `ALL /isMeetingRunning` - `HandleBBBIsMeetingRunning`
- [ ] `ALL /getMeetingInfo` - `HandleBBBGetMeetingInfo`
- [ ] `ALL /getMeetings` - `HandleBBBGetMeetings`
- [ ] `ALL /end` - `HandleBBBEndMeetings`
- [ ] `ALL /getRecordings` - `HandleBBBGetRecordings`
- [ ] `ALL /deleteRecordings` - `HandleBBBDeleteRecordings`
- [ ] `ALL /updateRecordings` - `HandleBBBUpdateRecordings`
- [ ] `ALL /publishRecordings` - `HandleBBBPublishRecordings`

## Main API Routes (Prefix: `/api`, Middleware: `HandleVerifyHeaderToken`)
- [x] `POST /api/verifyToken` - `HandleVerifyToken` ✅ **VERIFIED**
- [x] `POST /api/recording` - `HandleRecorderTasks` ✅ **VERIFIED**
- [x] `POST /api/rtmp` - `HandleRecorderTasks` ✅ **VERIFIED**
- [x] `POST /api/endRoom` - `HandleEndRoomForAPI` ✅ **VERIFIED**
- [x] `POST /api/changeVisibility` - `HandleChangeVisibilityForAPI` ✅ **VERIFIED**
- [ ] `POST /api/enableSipDialIn` - `HandleEnableRoomSipDialIn` (Missing in NestJS - SIP Excluded)
- [x] `POST /api/externalDisplayLink` - `HandleExternalDisplayLink` ✅ **VERIFIED**
- [x] `POST /api/externalMediaPlayer` - `HandleExternalMediaPlayer` ✅ **VERIFIED**

### Ingress
- [x] `POST /api/ingress/create` - `HandleCreateIngress` ✅ **VERIFIED**

### Waiting Room
- [x] `POST /api/waitingRoom/approveUsers` - `HandleApproveUsers` ✅ **VERIFIED**
- [x] `POST /api/waitingRoom/updateMsg` - `HandleUpdateWaitingRoomMessage` ✅ **VERIFIED**

### User Management
- [x] `POST /api/convertWhiteboardFile` - `HandleConvertWhiteboardFile` ✅ **VERIFIED**
- [x] `POST /api/updateLockSettings` - `HandleUpdateUserLockSetting` ✅ **VERIFIED**
- [x] `POST /api/muteUnmuteTrack` - `HandleMuteUnMuteTrack` ✅ **VERIFIED**
- [x] `POST /api/removeParticipant` - `HandleRemoveParticipant` ✅ **VERIFIED**
- [x] `POST /api/switchPresenter` - `HandleSwitchPresenter` ✅ **VERIFIED**

### Etherpad
- [ ] `POST /api/etherpad/create` - `HandleCreateEtherpad` (SKIPPED - Service implementation missing)
- [ ] `POST /api/etherpad/cleanPad` - `HandleCleanPad` (SKIPPED - Service implementation missing)
- [ ] `POST /api/etherpad/changeStatus` - `HandleChangeEtherpadStatus` (SKIPPED - Service implementation missing)

### Polls (Prefix: `/api/polls`)
- [x] `POST /api/polls/activate` - `HandleActivatePolls` ✅ **VERIFIED**
- [x] `POST /api/polls/create` - `HandleCreatePoll` ✅ **VERIFIED**
- [x] `GET /api/polls/listPolls` - `HandleListPolls` ✅ **VERIFIED**
- [x] `GET /api/polls/pollsStats` - `HandleGetPollsStats` ✅ **VERIFIED**
- [x] `GET /api/polls/countTotalResponses/:pollId` - `HandleCountPollTotalResponses` ✅ **VERIFIED**
- [x] `GET /api/polls/userSelectedOption/:pollId/:userId` - `HandleUserSelectedOption` ✅ **VERIFIED**
- [x] `GET /api/polls/pollResponsesDetails/:pollId` - `HandleGetPollResponsesDetails` ✅ **VERIFIED**
- [x] `GET /api/polls/pollResponsesResult/:pollId` - `HandleGetResponsesResult` ✅ **VERIFIED**
- [x] `POST /api/polls/submitResponse` - `HandleUserSubmitResponse` ✅ **VERIFIED**
- [x] `POST /api/polls/closePoll` - `HandleClosePoll` ✅ **VERIFIED**

### Breakout Room (Prefix: `/api/breakoutRoom`)
- [x] `POST /api/breakoutRoom/create` - `HandleCreateBreakoutRooms` ✅ **VERIFIED**
- [x] `POST /api/breakoutRoom/join` - `HandleJoinBreakoutRoom` ✅ **VERIFIED**
- [x] `GET /api/breakoutRoom/listRooms` - `HandleGetBreakoutRooms` ✅ **VERIFIED**
- [x] `GET /api/breakoutRoom/myRooms` - `HandleGetMyBreakoutRooms` ✅ **VERIFIED**
- [x] `POST /api/breakoutRoom/increaseDuration` - `HandleIncreaseBreakoutRoomDuration` ✅ **VERIFIED**
- [x] `POST /api/breakoutRoom/sendMsg` - `HandleSendBreakoutRoomMsg` ✅ **VERIFIED**
- [x] `POST /api/breakoutRoom/endRoom` - `HandleEndBreakoutRoom` ✅ **VERIFIED**
- [x] `POST /api/breakoutRoom/endAllRooms` - `HandleEndBreakoutRooms` ✅ **VERIFIED**

### File Management
- [x] `GET /api/fileUpload` - `HandleFileUpload` ✅ **VERIFIED**
- [x] `POST /api/fileUpload` - `HandleFileUpload` ✅ **VERIFIED**
- [x] `POST /api/uploadedFileMerge` - `HandleUploadedFileMerge` ✅ **VERIFIED**
- [x] `POST /api/uploadBase64EncodedData` - `HandleUploadBase64EncodedData` ✅ **VERIFIED**
- [x] `ALL /api/getRoomFilesByType` - `HandleGetRoomFilesByType` ✅ **VERIFIED**

### Insights / AI (Prefix: `/api/insights`)
- [x] `POST /api/insights/supportedLangs` - `HandleGetSupportedLangs` ✅ **VERIFIED**
#### Transcription
- [x] `POST /api/insights/transcription/configure` - `HandleTranscriptionConfigure` ✅ **VERIFIED**
- [x] `POST /api/insights/transcription/end` - `HandleEndTranscription` ✅ **VERIFIED**
- [x] `POST /api/insights/transcription/userSession` - `HandleTranscriptionUserSession` ✅ **VERIFIED**
- [x] `POST /api/insights/transcription/userStatus` - `HandleGetTranscriptionUserTaskStatus` ✅ **VERIFIED**
#### Translation
- [x] `POST /api/insights/translation/chat/configure` - `HandleChatTranslationConfigure` ✅ **VERIFIED**
- [x] `POST /api/insights/translation/chat/end` - `HandleEndChatTranslation` ✅ **VERIFIED**
- [x] `POST /api/insights/translation/chat/execute` - `HandleExecuteChatTranslation` ✅ **VERIFIED**
#### AI Features
- [x] `POST /api/insights/ai/textChat/configure` - `HandleAITextChatConfigure` ✅ **VERIFIED**
- [x] `POST /api/insights/ai/textChat/execute` - `HandleExecuteAITextChat` ✅ **VERIFIED**
- [x] `POST /api/insights/ai/textChat/end` - `HandleEndAITextChat` ✅ **VERIFIED**
- [x] `POST /api/insights/ai/meetingSummarization/configure` - `HandleAIMeetingSummarizationConfig` ✅ **VERIFIED**
- [x] `POST /api/insights/ai/meetingSummarization/end` - `HandleEndAIMeetingSummarization` ✅ **VERIFIED**
