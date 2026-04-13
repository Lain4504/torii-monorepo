# Voice Agent Mobile Integration Guide

This guide explains how to apply the existing voice-agent feature in this repository to a mobile app (React Native or Flutter) using the current production architecture.

## 1. Confirmed Current Architecture

The repository already has a working Voice Agent stack:

- Gateway endpoint issues LiveKit token: `POST /api/agents/livekit-token`
- Gateway enforces auth and quota before issuing token
- Token includes room-level dispatch (`roomConfig.agents[agentName]`), so LiveKit can auto-dispatch the worker
- Voice worker runs in `apps/voice-agent` and handles real-time audio with Gemini

Important: with this flow, mobile should NOT call `voice-agent/start` in production.

## 2. End-to-End Mobile Flow

1. User logs in on mobile and gets app access token (JWT).
2. Mobile calls gateway `POST /api/agents/livekit-token` with `Authorization: Bearer <jwt>`.
3. Gateway returns `token`, `wsUrl`, `roomId`.
4. Mobile connects to LiveKit room using that token.
5. LiveKit auto-dispatches the agent worker by `VOICE_AGENT_NAME`.
6. User and agent talk over LiveKit audio.
7. Mobile disconnects room when user ends session.

## 3. Backend Prerequisites

Before mobile integration, verify these server-side settings.

### 3.1 Gateway config for roleplay LiveKit

File: `apps/server/config/config.yaml`

Required section:

```yaml
livekitRoleplay:
  apiUrl: "wss://<your-livekit>.livekit.cloud"
  wsUrl: "wss://<your-livekit>.livekit.cloud"
  apiKey: "<roleplay_api_key>"
  apiSecret: "<roleplay_api_secret>"
```

### 3.2 Worker env

File: `apps/voice-agent/.env` (or deployment env)

Required:

```env
LIVEKIT_URL=wss://<your-livekit>.livekit.cloud
LIVEKIT_API_KEY=<roleplay_api_key>
LIVEKIT_API_SECRET=<roleplay_api_secret>
VOICE_AGENT_NAME=torii-voice-agent
GOOGLE_API_KEY=<server_gemini_key>
```

### 3.3 Agent name parity

`VOICE_AGENT_NAME` must match between:

- Gateway process env
- Voice agent worker env

If mismatch: token is valid, but no worker joins room.

### 3.4 CORS and auth

Mobile normally uses bearer token auth. Ensure gateway accepts:

- Header: `Authorization: Bearer <access_token>`

## 4. API Contract for Mobile

## 4.1 Create voice session token

Endpoint:

- `POST /api/agents/livekit-token`

Headers:

- `Authorization: Bearer <jwt>`
- `Content-Type: application/json`

Body:

```json
{
  "graphName": "japanese_tutor",
  "geminiApiKey": "optional-client-key"
}
```

`graphName` supported in current UI flow:

- `japanese_tutor`
- `roleplay`
- `free_conversation`

Success response shape:

```json
{
  "success": true,
  "data": {
    "token": "<livekit_jwt>",
    "wsUrl": "wss://...livekit.cloud",
    "roomId": "roleplay-japanese_tutor-<userId>-<sessionId>",
    "quota": {
      "...": "status payload"
    }
  }
}
```

Failure examples:

- Unauthorized (missing/invalid bearer token)
- Quota exceeded (ai turns consumed)
- Misconfigured `livekitRoleplay`

## 4.2 Do not call these in production mobile flow

- `POST /voice-agent/start`
- `POST /voice-agent/stop`

Those endpoints are fallback/manual flow and are not needed when token dispatch is configured in gateway.

## 5. React Native Implementation (Recommended)

## 5.1 Install packages

Choose package versions compatible with your RN version.

```bash
pnpm add livekit-client @livekit/react-native @livekit/react-native-webrtc
```

Follow platform setup from LiveKit RN docs for WebRTC native modules.

## 5.2 Permission setup

Android (`AndroidManifest.xml`):

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.INTERNET" />
```

iOS (`Info.plist`):

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Microphone access is required for AI voice conversation.</string>
```

## 5.3 Token request service

```ts
type GraphName = "japanese_tutor" | "roleplay" | "free_conversation";

type VoiceTokenData = {
  token: string;
  wsUrl: string;
  roomId: string;
};

export async function fetchVoiceToken(params: {
  apiBaseUrl: string;
  appAccessToken: string;
  graphName: GraphName;
  geminiApiKey?: string;
}): Promise<VoiceTokenData> {
  const resp = await fetch(`${params.apiBaseUrl}/api/agents/livekit-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.appAccessToken}`,
    },
    body: JSON.stringify({
      graphName: params.graphName,
      geminiApiKey: params.geminiApiKey,
    }),
  });

  const payload = await resp.json().catch(() => null);

  if (!resp.ok || !payload?.success || !payload?.data) {
    const message = payload?.message || payload?.error || "Failed to get voice token";
    throw new Error(message);
  }

  return payload.data as VoiceTokenData;
}
```

## 5.4 Connect to LiveKit room

```ts
import { Room, RoomEvent } from "livekit-client";

export async function startVoiceSession(tokenData: {
  token: string;
  wsUrl: string;
}) {
  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  });

  room
    .on(RoomEvent.Connected, () => {
      console.log("LiveKit connected");
    })
    .on(RoomEvent.Disconnected, () => {
      console.log("LiveKit disconnected");
    })
    .on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
      console.log("quality", participant?.identity, quality);
    });

  await room.connect(tokenData.wsUrl, tokenData.token);

  await room.localParticipant.setMicrophoneEnabled(true);

  return room;
}
```

## 5.5 Stop session

```ts
export async function stopVoiceSession(room: Room | null) {
  if (!room) return;
  await room.localParticipant.setMicrophoneEnabled(false);
  room.disconnect();
}
```

## 6. Flutter Implementation (Alternative)

Use `livekit_client` package and the same token endpoint.

## 6.1 Fetch token

```dart
Future<Map<String, dynamic>> fetchVoiceToken({
  required String apiBaseUrl,
  required String appAccessToken,
  required String graphName,
}) async {
  final response = await http.post(
    Uri.parse('$apiBaseUrl/api/agents/livekit-token'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $appAccessToken',
    },
    body: jsonEncode({'graphName': graphName}),
  );

  final payload = jsonDecode(response.body);

  if (response.statusCode < 200 || response.statusCode >= 300 || payload['success'] != true) {
    throw Exception(payload['message'] ?? payload['error'] ?? 'Failed to get token');
  }

  return payload['data'] as Map<String, dynamic>;
}
```

## 6.2 Connect and publish mic

```dart
final room = Room();
await room.connect(tokenData['wsUrl'], tokenData['token']);
await room.localParticipant?.setMicrophoneEnabled(true);

// On end:
await room.localParticipant?.setMicrophoneEnabled(false);
await room.disconnect();
```

## 7. Runtime Graph Switching (Optional)

Current web flow supports changing graph mid-session through `pg.updateConfig` RPC.

For mobile, implement one of these:

1. Preferred simple approach: reconnect with a new token for a new `graphName`.
2. Advanced approach: call agent RPC `pg.updateConfig` after agent participant appears (if mobile SDK version exposes RPC API).

If you choose reconnect, steps are deterministic:

1. Disconnect current room.
2. Request new token with new `graphName`.
3. Connect new room.

## 8. Production Hardening Checklist

1. Keep `LIVEKIT_ALLOW_CLIENT_GEMINI_KEY=false` in production unless strictly required.
2. Run exactly one worker group per `VOICE_AGENT_NAME` and environment.
3. Do not run local worker and Docker worker at the same time with same LiveKit credentials.
4. Monitor worker logs for startup registration and room joins.
5. Enforce HTTPS on gateway and mobile API base URL.

## 9. Quick Verification Script

After deploying backend, verify token endpoint first:

```bash
curl -X POST "https://<api-domain>/api/agents/livekit-token" \
  -H "Authorization: Bearer <mobile_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"graphName":"japanese_tutor"}'
```

Expected result:

- HTTP 200
- `success: true`
- `data.token`, `data.wsUrl`, `data.roomId` present

Then verify from mobile:

1. Connect success in under 5-10s.
2. Agent participant joins room automatically.
3. User speech is captured and agent answers with audio.
4. Disconnect ends session cleanly.

## 10. Common Failure Modes

## 10.1 Token success but no agent audio

Check:

- Worker is running and registered
- `VOICE_AGENT_NAME` matches gateway
- No duplicate workers with same credentials

## 10.2 401 or unauthorized on token endpoint

Check:

- Mobile sends `Authorization: Bearer <jwt>`
- JWT not expired
- Gateway auth guard configuration for mobile clients

## 10.3 Quota exhausted

Gateway returns quota-related error from `ai_turns` consumption.

UI should show a clear upgrade/retry message.

## 10.4 Connects, but user speech is not detected

Check:

- OS microphone permission granted
- Local participant microphone enabled
- Bluetooth/audio-route conflicts on device
- Worker logs for track subscription and participant binding

## 11. Suggested Mobile Release Plan

1. Milestone 1: token fetch + connect + mic publish.
2. Milestone 2: stable disconnect/reconnect handling.
3. Milestone 3: graph switching (reconnect strategy).
4. Milestone 4: telemetry (connect time, drop rate, no-audio rate).

This staged rollout reduces risk and makes debugging much easier in production.

## 12. Critical Gaps For Real Production Mobile

The sections above are enough for MVP integration. For stable production behavior on real devices, add the following:

1. App lifecycle handling (foreground/background, call interruptions, route changes).
2. Audio session configuration per platform (speaker route, Bluetooth, focus handling).
3. Token expiry handling and proactive reconnect before token expiration.
4. Retry strategy with capped exponential backoff.
5. Voice telemetry to detect regressions (connect latency, no-audio, reconnect rate).

## 13. React Native Production Notes

## 13.1 Runtime microphone permission request

Do not rely only on manifest/plist; request mic permission at runtime.

```ts
import { PermissionsAndroid, Platform } from "react-native";

export async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: "Microphone permission",
      message: "Microphone access is required for voice conversation",
      buttonPositive: "Allow",
      buttonNegative: "Deny",
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}
```

## 13.2 App lifecycle policy

Suggested policy for a learning app:

1. On app background: mute mic immediately.
2. If app stays background > 30s: disconnect room.
3. On foreground return: request a new token and reconnect.

This avoids stale room states and improves recovery after network transitions.

## 13.3 Reconnect wrapper with backoff

```ts
export async function reconnectWithBackoff(connectFn: () => Promise<void>) {
  const delays = [300, 700, 1500, 3000, 5000];
  let lastError: unknown;

  for (const delay of delays) {
    try {
      await connectFn();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Reconnect failed");
}
```

## 13.4 Token refresh policy

Current gateway TTL is 2 hours. In production mobile, do not keep one room forever.

Recommended:

1. Store session start timestamp.
2. At 100-105 minutes, gracefully reconnect with a newly issued token.
3. If reconnect fails, show retry prompt and keep UI state consistent.

## 14. Flutter Production Notes

## 14.1 Runtime permission

Use `permission_handler` and request mic permission before connect.

```dart
Future<void> ensureMicPermission() async {
  final status = await Permission.microphone.request();
  if (!status.isGranted) {
    throw Exception('Microphone permission denied');
  }
}
```

## 14.2 App lifecycle handling

Use `WidgetsBindingObserver`:

1. On `AppLifecycleState.paused`: mute mic.
2. On long background or `detached`: disconnect.
3. On `resumed`: fetch new token and reconnect.

## 14.3 Audio route and interruption handling

Handle these cases explicitly:

1. Bluetooth headset connect/disconnect.
2. Phone call interruption.
3. Speaker route switching.

Without this, users often report "connected but cannot hear" or "agent cannot hear me".

## 15. Mobile Observability Events (Recommended)

Track these events from app to analytics/log system:

1. `voice_token_request_started`
2. `voice_token_request_success`
3. `voice_room_connect_started`
4. `voice_room_connected`
5. `voice_agent_first_audio_ms`
6. `voice_reconnect_attempt`
7. `voice_no_audio_detected`
8. `voice_session_ended`

Minimum fields for each event:

1. `userId`
2. `roomId`
3. `graphName`
4. `networkType`
5. `deviceModel`
6. `osVersion`

These are essential for diagnosing field issues quickly.
