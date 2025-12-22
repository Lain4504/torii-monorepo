export * from './nats-service.config';
export * from './prisma.service';
export * from './services/auth.service';
export * from './services/livekit.service';
export * from './services/redis.service';
export * from './shared.module';
export * from './prisma.module';
export * from './supabase/supabase.constants';
export * from './supabase/supabase.module';


export * from './filters/all-exceptions.filter';
export * from './interceptors/protobuf.interceptor';
export * from './nats/nats.service';
export * from './nats/nats-auth.module';
export * from './nats/nats-client.module';
export * from './utils/slug.utils';
export * from './pipes/protobuf-parser.pipe';
export * from './guards'; // Guards: ApiKeyGuard, JwtAuthGuard



/**
 * Utils module - TypeScript clone of plugnmeet-protocol/utils and auth
 *
 * Exports all utility functions equivalent to Go implementation
 */

// Common utilities (from utils/common.go)
export {
    prepareCommonWebhookNotifyEvent,
    sendCommonProtobufResponse,
    sendProtobufResponse,
    sendCommonProtoJsonResponse,
    sendProtoJsonResponse,
    getFilesFromDir,
    generateSecureRandomString,
    generateRandomString,
} from './utils/common';

// Access token generation (from auth/access_token.go)
export {
    generatePlugNmeetJWTAccessToken,
    generateLivekitAccessToken,
    generateTokenForDownloadRecording,
} from './utils/access_token';

// Token verification (from auth/verify_token.go)
export {
    verifyPlugNmeetAccessToken,
} from './utils/verify_token';

// NATS utilities (from utils/nats.go)
export {
    nkeyOptionFromSeedText,
    sigHandler,
    nKeyPairFromSeed,
    wipeSlice,
} from './utils/nats';

// LTI v1 utilities (from utils/lti_v1.go)
export {
    assignLTIV1CustomParams,
    prepareLTIV1RoomCreateReq,
} from './utils/lti_v1';

// Create room utilities (from utils/create_room.go)
export {
    prepareDefaultRoomFeatures,
    setCreateRoomDefaultValues,
    setRoomDefaultLockSettings,
    setDefaultRoomSettings,
    type RoomDefaultSettings,
} from './utils/create_room';

// Webhook verification (from webhook/verify.go)
export {
    verifyWebhookRequest,
} from './utils/webhook_verify';

// Webhook queue worker (from webhook/queue_worker.go)
export {
    WebhookQueueWorker,
} from './utils/webhook_queue_worker';

// Webhook notifier (from webhook/notifier.go)
export {
    WebhookNotifier,
} from './utils/webhook_notifier';
