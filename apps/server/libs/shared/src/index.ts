export * from './prisma.service';
export * from './shared.module';
export * from './prisma.module';
export * from './supabase/supabase.constants';
export * from './supabase/supabase.module';

// NATS modules and configuration
export * from './nats/nats-client.module';
export * from './nats/nats-auth.module';
export * from './nats/nats-auth.service';
export { createNatsServiceConfig } from './nats/nats-service.config';

export * from './utils/slug.utils';
export * from './guards/api-key.guard';
export * from './guards/jwt-auth.guard';
export * from './utils/webhook_verify';



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

// Proto parser (from controllers/analytics.go)
export {
    parseProtoRequest,           // Flexible parser (JSON or binary)
    parseAndValidateRequest,     // Parser + validation (full Go equivalent)
    validateRequest,             // Validation only
} from './utils/proto-parser';

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
