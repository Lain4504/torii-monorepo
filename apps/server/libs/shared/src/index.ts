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
// Guards
export * from './guards/api-key.guard';
export * from './guards/jwt.guard';
export * from './guards/role.guard';

// Decorators
export * from './decorators/roles.decorator';

export * from './utils/slug.utils';
export * from './guards/api-key.guard';
export * from './guards/jwt-auth.guard';
export * from './utils/webhook_verify';



/**
 * Utils module
 *
 * Exports all utility functions
 */

// Common utilities
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

// Proto parser
export {
    parseProtoRequest,           // Flexible parser (JSON or binary)
    parseAndValidateRequest,     // Parser + validation
    validateRequest,             // Validation only
} from './utils/proto-parser';

// Access token generation
export {
    generateWajlcJWTAccessToken,
    generateLivekitAccessToken,
    generateTokenForDownloadRecording,
} from './utils/access_token';

// Token verification )
export {
    verifyWajlcAccessToken,
} from './utils/verify_token';

// NATS utilities
export {
    nkeyOptionFromSeedText,
    sigHandler,
    nKeyPairFromSeed,
    wipeSlice,
} from './utils/nats';

// LTI v1 utilities
export {
    assignLTIV1CustomParams,
    prepareLTIV1RoomCreateReq,
} from './utils/lti_v1';

// Create room utilities
export {
    prepareDefaultRoomFeatures,
    setCreateRoomDefaultValues,
    setRoomDefaultLockSettings,
    setDefaultRoomSettings,
    type RoomDefaultSettings,
} from './utils/create_room';

// Webhook verification
export {
    verifyWebhookRequest,
} from './utils/webhook_verify';

// Webhook queue worker
export {
    WebhookQueueWorker,
} from './utils/webhook_queue_worker';

// Webhook notifier
export {
    WebhookNotifier,
} from './utils/webhook_notifier';
