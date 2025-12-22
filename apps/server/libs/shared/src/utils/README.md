# Room Service Utils

TypeScript clone của `plugnmeet-protocol/utils` và `plugnmeet-protocol/auth` từ Go implementation.

## 📁 Files

### 1. `common.ts` 
Clone từ `plugnmeet-protocol/utils/common.go`

**Functions:**
- `prepareCommonWebhookNotifyEvent()` - Convert LiveKit WebhookEvent → CommonNotifyEvent
- `sendCommonProtobufResponse()` - Send CommonResponse as protobuf binary
- `sendProtobufResponse()` - Send any protobuf message as binary
- `sendCommonProtoJsonResponse()` - Send CommonResponse as JSON
- `sendProtoJsonResponse()` - Send any protobuf message as JSON
- `getFilesFromDir()` - Get files from directory with filtering/sorting
- `generateSecureRandomString()` - Cryptographically secure random string
- `generateRandomString()` - Fast random string

### 2. `access_token.ts`
Clone từ `plugnmeet-protocol/auth/access_token.go`

**Functions:**
- `generatePlugNmeetJWTAccessToken()` - Generate PlugNmeet JWT access token
- `generateLivekitAccessToken()` - Generate LiveKit access token
- `generateTokenForDownloadRecording()` - Generate token for downloading recordings

### 3. `verify_token.ts`
Clone từ `plugnmeet-protocol/auth/verify_token.go`

**Functions:**
- `verifyPlugNmeetAccessToken()` - Verify PlugNmeet access token with graceful period support

### 4. `nats.ts`
Clone từ `plugnmeet-protocol/utils/nats.go`

**Functions:**
- `nkeyOptionFromSeedText()` - Create NATS NKey option from seed
- `sigHandler()` - Sign nonce with seed (reference implementation)
- `nKeyPairFromSeed()` - Create key pair from seed (reference implementation)
- `wipeSlice()` - Securely wipe buffer contents

**Note:** NestJS/nats.js handles NKey authentication automatically. These are reference implementations showing Go concepts.

###5. `lti_v1.ts`
Clone từ `plugnmeet-protocol/utils/lti_v1.go`

**Functions:**
- `assignLTIV1CustomParams()` - Parse LTI v1 custom parameters from URL params
- `prepareLTIV1RoomCreateReq()` - Create room request from LTI claims

### 6. `create_room.ts`
Clone từ `plugnmeet-protocol/utils/create_room.go`

**Functions:**
- `prepareDefaultRoomFeatures()` - Set default room features with backward compatibility
- `setCreateRoomDefaultValues()` - Apply server configuration defaults
- `setRoomDefaultLockSettings()` - Set default lock settings
- `setDefaultRoomSettings()` - Apply global room defaults from config

**Types:**
- `RoomDefaultSettings` - Room default settings interface

---

## 🔄 Go ↔ TypeScript Mapping

### Libraries

| Go Package | TypeScript Package | Purpose |
|------------|-------------------|---------|
| `google.golang.org/protobuf` | `@bufbuild/protobuf` | Protobuf runtime |
| `github.com/go-jose/go-jose/v4` | `jsonwebtoken` | JWT signing/verification |
| `github.com/livekit/protocol/auth` | `livekit-server-sdk` | LiveKit token generation |
| `github.com/nats-io/nats.go` | `@nestjs/microservices` | NATS client |

### Field Type Mappings

| Go Type | Protobuf | TypeScript |
|---------|----------|------------|
| `uint64` | `uint64 [(jstype) = JS_STRING]` | `string` |
| `uint32` | `uint32` | `number` |
| `int64` | `int64 [(jstype) = JS_STRING]` | `string` |
| `bool` | `bool` | `boolean` |
| `string` | `string` | `string` |
| `*Type` (pointer) | `optional Type` | `Type \| undefined` |

---

## 📦 Dependencies

Đã có trong `package.json`:
```json
{
  "jsonwebtoken": "^9.0.3",
  "livekit-server-sdk": "...",
  "@bufbuild/protobuf": "^2.10.1",
  "@nestjs/microservices": "...",
}
```

---

## 🎯 Usage Examples

### Generate & Verify Tokens

```typescript
import { 
  generatePlugNmeetJWTAccessToken,
  generateLivekitAccessToken,
  verifyPlugNmeetAccessToken 
} from '@server/modules/room-service/utils';
import { create, PlugNmeetTokenClaimsSchema } from '@workspace/protocol';

// Create claims
const claims = create(PlugNmeetTokenClaimsSchema, {
  userId: 'user123',
  roomId: 'room456',
  name: 'John Doe',
  isAdmin: true,
  isHidden: false,
});

// Generate PlugNmeet JWT
const token = generatePlugNmeetJWTAccessToken(
  'api-key',
  'api-secret',
  'user123',
  3600, // 1 hour
  claims
);

// Generate LiveKit token
const livekitToken = await generateLivekitAccessToken(
  'livekit-api-key',
  'livekit-api-secret',
  7200, // 2 hours
  claims
);

// Verify token with graceful period
try {
  const verifiedClaims = verifyPlugNmeetAccessToken(
    'api-key',
    'api-secret',
    token,
    300 // 5 minutes graceful period
  );
  console.log('User ID:', verifiedClaims.userId);
} catch (error) {
  console.error('Token invalid:', error.message);
}
```

### Create  Room with Defaults

```typescript
import {
  prepareDefaultRoomFeatures,
  setCreateRoomDefaultValues,
  setRoomDefaultLockSettings,
  setDefaultRoomSettings,
  type RoomDefaultSettings,
} from '@server/modules/room-service/utils';
import { create, CreateRoomReqSchema } from '@workspace/protocol';

// Create room request
const req = create(CreateRoomReqSchema, {
  roomId: 'my-room',
  metadata: {
    roomTitle: 'My Room',
    roomFeatures: {},
  },
});

// Apply default features
prepareDefaultRoomFeatures(req);

// Apply server config
setCreateRoomDefaultValues(
  req,
  10485760n, // 10MB max file upload
  30n, // 30MB whiteboard
  ['jpg', 'png', 'pdf'],
  true // allow notepad
);

// Set lock settings
setRoomDefaultLockSettings(req);

// Apply global defaults
const defaults: RoomDefaultSettings = {
  maxParticipants: 100,
  maxDuration: 14400n, // 4 hours
  maxNumBreakoutRooms: 8,
};
setDefaultRoomSettings(defaults, req);
```

### LTI v1 Integration

```typescript
import { assignLTIV1CustomParams, prepareLTIV1RoomCreateReq } from '@server/modules/room-service/utils';
import { create, LtiClaimsSchema } from '@workspace/protocol';

// Parse LTI parameters
const ltiParams = new URLSearchParams(request.body);
const claims = create(LtiClaimsSchema, {
  roomId: 'lti-room',
  roomTitle: 'LTI Room',
});

assignLTIV1CustomParams(ltiParams, claims);

// Create room from LTI claims
const roomReq = prepareLTIV1RoomCreateReq(claims);
```

---

## ✅ Testing

All functions **match Go implementation logic exactly**:

- ✅ Same protobuf message types
- ✅ Same default values
- ✅ Same backward compatibility handling
- ✅ Same validation rules
- ✅ Graceful period support for token expiration
- ✅ Strict NotBefore validation

---

## 🔒 Security Notes

1. **Token Graceful Period**: Allows expired tokens to remain valid for a specified duration
   - Default: `0` (strict validation)
   - Use case: Token renewal, clock skew tolerance
   
2. **NotBefore**: Always validated strictly (no graceful period)

3. **Buffer Wiping**: Sensitive data (seeds, keys) wiped after use

4. **Random String Generation**:
   - `generateSecureRandomString()` - Cryptographically secure (use for tokens, keys)
   - `generateRandomString()` - Fast but less secure (use for IDs)

---

## 📚 Related Documentation

- [PlugNmeet Protocol (Go)](https://github.com/mynaparrot/plugnmeet-protocol)
- [@bufbuild/protobuf](https://github.com/bufbuild/protobuf-es)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [LiveKit Server SDK](https://github.com/livekit/server-sdk-js)
- [NATS.js](https://github.com/nats-io/nats.js)
