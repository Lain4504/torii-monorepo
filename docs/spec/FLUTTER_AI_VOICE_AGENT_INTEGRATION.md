# Huong Dan Tich Hop AI Voice Agent Vao Flutter

Tai lieu nay huong dan chi tiet cach tich hop tinh nang AI Voice Agent cua Torii vao mobile app Flutter, bam sat kien truc hien tai cua repo (token-based dispatch qua Gateway + LiveKit Cloud + Voice Agent Worker).

## 1. Muc tieu

- Mobile app goi Gateway de lay LiveKit token.
- Flutter ket noi truc tiep toi LiveKit room bang token vua nhan.
- Voice Agent tu dong duoc dispatch theo `agentName` (khong can goi `/voice-agent/start` hay `/voice-agent/stop`).
- Mobile app dong session dung cach va (tuy chon) gui thong tin usage khi ket thuc.

## 2. Kien truc tong quan

```text
Flutter App
  -> POST /api/agents/livekit-token (Gateway, co Bearer token)
  -> Nhan { token, wsUrl, roomId }
  -> Connect LiveKit bang token
  -> Voice Agent worker tu dong duoc dispatch vao room
  -> Voice stream 2 chieu user <-> agent
  -> POST /api/agents/livekit-end khi ket thuc
```

## 3. Yeu cau truoc khi tich hop

### 3.1 Backend/Deploy

Can dam bao he thong da co cac service:

- `gateway`
- `voice-agent`
- `livekit` (hoac LiveKit Cloud)
- `nats`, `redis`, `postgres` (cho he thong gateway)

Can dam bao `VOICE_AGENT_NAME` giong nhau giua Gateway va voice-agent worker.

### 3.2 Gateway endpoint

Voice flow hien tai su dung endpoint:

- `POST /api/agents/livekit-token`
- `POST /api/agents/livekit-end`

Ca 2 endpoint deu yeu cau auth (`GatewayAuthGuard`), nen Flutter phai gui header:

- `Authorization: Bearer <access_token>`

### 3.3 Quota

Gateway co check quota tren feature `ai_turns` truoc khi cap token. Neu het quota thi API tra error.

## 4. Contract API cho Flutter

## 4.1 Lay token LiveKit

Endpoint: `POST /api/agents/livekit-token`

Request body:

```json
{
  "graphName": "japanese_tutor",
  "geminiApiKey": ""
}
```

Ghi chu:

- `graphName` ho tro:
  - `japanese_tutor`
  - `roleplay`
  - `free_conversation`
- `geminiApiKey` la tuy chon.
  - Neu truyen, backend uu tien key theo session metadata.
  - Neu khong truyen, backend fallback key server env.

Response thanh cong:

```json
{
  "success": true,
  "data": {
    "token": "<livekit_jwt>",
    "wsUrl": "wss://<project>.livekit.cloud",
    "roomId": "roleplay-japanese_tutor-<userId>-<sessionId>",
    "quota": {
      "limit": 30,
      "used": 12,
      "remaining": 18,
      "tier": "free"
    }
  }
}
```

## 4.2 Ket thuc session

Endpoint: `POST /api/agents/livekit-end`

Request body:

```json
{
  "roomName": "roleplay-japanese_tutor-...",
  "inputTokens": 0,
  "outputTokens": 0,
  "totalTokens": 0,
  "durationSec": 95
}
```

Response hien tai:

```json
{
  "success": true,
  "data": {
    "billed": false
  }
}
```

Ghi chu:

- Hien tai billing thong qua endpoint nay dang de che do disabled (`billed: false`).
- Van nen goi endpoint de giu compatibility va de san cho billing logic sau nay.

## 5. Cai dat Flutter packages

Trong project Flutter:

```bash
flutter pub add dio livekit_client permission_handler
```

Neu app can logging de debug:

```bash
flutter pub add logger
```

## 6. Quyen microphone

## 6.1 Android

Cap nhat `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.INTERNET" />
```

## 6.2 iOS

Cap nhat `ios/Runner/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Ung dung can microphone de hoi thoai voi AI Sensei.</string>
```

## 7. Thiet ke module trong Flutter

Nen tach thanh 3 lop:

1. `SenseiApiClient`: goi REST API cua Gateway.
2. `VoiceSessionController`: quan ly ket noi LiveKit + state session.
3. `VoicePage` (UI): bind state de hien thi `idle`, `connecting`, `connected`, `error`.

## 8. Code mau

### 8.1 Model va API client

```dart
import 'package:dio/dio.dart';

class LivekitTokenData {
  final String token;
  final String wsUrl;
  final String roomId;

  LivekitTokenData({
    required this.token,
    required this.wsUrl,
    required this.roomId,
  });

  factory LivekitTokenData.fromJson(Map<String, dynamic> json) {
    return LivekitTokenData(
      token: json['token'] as String,
      wsUrl: json['wsUrl'] as String,
      roomId: json['roomId'] as String,
    );
  }
}

class SenseiApiClient {
  final Dio _dio;

  SenseiApiClient({
    required String baseUrl,
    required String accessToken,
  }) : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
            },
          ),
        );

  Future<LivekitTokenData> getLivekitToken({
    required String graphName,
    String? geminiApiKey,
  }) async {
    final response = await _dio.post(
      '/api/agents/livekit-token',
      data: {
        'graphName': graphName,
        if (geminiApiKey != null && geminiApiKey.isNotEmpty)
          'geminiApiKey': geminiApiKey,
      },
    );

    final payload = response.data as Map<String, dynamic>;
    if (payload['success'] != true || payload['data'] == null) {
      throw Exception(payload['message'] ?? 'Failed to get LiveKit token');
    }

    return LivekitTokenData.fromJson(payload['data'] as Map<String, dynamic>);
  }

  Future<void> endLivekitSession({
    required String roomName,
    int inputTokens = 0,
    int outputTokens = 0,
    int totalTokens = 0,
    int durationSec = 0,
  }) async {
    await _dio.post(
      '/api/agents/livekit-end',
      data: {
        'roomName': roomName,
        'inputTokens': inputTokens,
        'outputTokens': outputTokens,
        'totalTokens': totalTokens,
        'durationSec': durationSec,
      },
    );
  }
}
```

### 8.2 Voice session controller

```dart
import 'dart:async';
import 'package:livekit_client/livekit_client.dart';
import 'package:permission_handler/permission_handler.dart';

enum VoiceUiState { idle, connecting, connected, error }

class VoiceSessionController {
  final SenseiApiClient api;

  Room? room;
  VoiceUiState state = VoiceUiState.idle;
  String? roomId;
  String? errorMessage;
  DateTime? startedAt;

  final _stateController = StreamController<VoiceUiState>.broadcast();
  Stream<VoiceUiState> get stateStream => _stateController.stream;

  EventsListener<RoomEvent>? roomListener;

  VoiceSessionController({required this.api});

  Future<void> connect({
    required String graphName,
    String? geminiApiKey,
  }) async {
    try {
      _setState(VoiceUiState.connecting);
      errorMessage = null;

      final micStatus = await Permission.microphone.request();
      if (!micStatus.isGranted) {
        throw Exception('Microphone permission denied');
      }

      final tokenData = await api.getLivekitToken(
        graphName: graphName,
        geminiApiKey: geminiApiKey,
      );

      roomId = tokenData.roomId;
      startedAt = DateTime.now();

      final r = Room();
      room = r;

      roomListener = r.createListener()
        ..on<RoomConnectedEvent>((event) {
          // Connected to LiveKit room
        })
        ..on<RoomDisconnectedEvent>((event) {
          // Remote disconnect / error
        })
        ..on<ParticipantConnectedEvent>((event) {
          // Agent participant usually has identity starts with "agent-"
        });

      await r.connect(
        tokenData.wsUrl,
        tokenData.token,
        connectOptions: const ConnectOptions(
          autoSubscribe: true,
        ),
      );

      await r.localParticipant?.setMicrophoneEnabled(true);
      _setState(VoiceUiState.connected);
    } catch (e) {
      errorMessage = e.toString();
      _setState(VoiceUiState.error);
      rethrow;
    }
  }

  Future<void> disconnect() async {
    final currentRoom = room;
    final currentRoomId = roomId;
    final started = startedAt;

    room = null;
    roomId = null;
    startedAt = null;

    try {
      await currentRoom?.disconnect();
    } catch (_) {}

    roomListener?.dispose();
    roomListener = null;

    if (currentRoomId != null && started != null) {
      final durationSec = DateTime.now().difference(started).inSeconds;
      try {
        await api.endLivekitSession(
          roomName: currentRoomId,
          durationSec: durationSec,
        );
      } catch (_) {
        // Do not block UI when end-session tracking fails
      }
    }

    _setState(VoiceUiState.idle);
  }

  bool get hasAgentParticipant {
    final r = room;
    if (r == null) return false;
    return r.remoteParticipants.values.any(
      (p) => p.identity.startsWith('agent-'),
    );
  }

  void _setState(VoiceUiState newState) {
    state = newState;
    _stateController.add(newState);
  }

  Future<void> dispose() async {
    await disconnect();
    await _stateController.close();
  }
}
```

### 8.3 UI status map

Khuyen nghi mapping state:

- `idle`: hien nut Bat dau
- `connecting`: hien loading "Dang ket noi phong..."
- `connected` + chua thay participant agent: hien "Dang cho Sensei vao lop..."
- `connected` + da thay agent participant: hien "Sensei dang lang nghe / dang noi"
- `error`: hien thong bao + nut thu lai

## 9. Doi graph trong khi dang trong phien (nang cao)

Web hien tai ho tro runtime update bang RPC method `pg.updateConfig`.

Neu Flutter SDK version dang dung co ho tro participant RPC, co the lam nhu sau:

1. Tim participant agent (identity bat dau bang `agent-`).
2. Goi RPC den participant do voi method `pg.updateConfig`.
3. Payload JSON cung format backend dang doc:

```json
{
  "graphName": "roleplay",
  "model": "gemini-2.5-flash-native-audio-preview-12-2025",
  "voice": "Puck",
  "temperature": 0.8,
  "instructions": "...",
  "modalities": "audio_only",
  "max_output_tokens": "inf",
  "gemini_api_key": ""
}
```

Neu Flutter SDK chua ho tro RPC method nay, dung fallback:

- Disconnect session hien tai.
- Goi lai `POST /api/agents/livekit-token` voi `graphName` moi.
- Connect lai room moi.

## 10. Xu ly loi va troubleshooting

## 10.1 Loi "Dang cho Sensei vao lop..." qua lau

Kiem tra tren VPS:

```bash
docker compose logs --since=5m gateway voice-agent
```

Can thay:

- Gateway nhan `/api/agents/livekit-token`
- Voice-agent `received job request`

Neu khong thay `received job request`:

- Kiem tra `VOICE_AGENT_NAME` co giong nhau hay khong.
- Kiem tra `livekitRoleplay` trong config gateway.

## 10.2 Loi Gemini key het han

Dau hieu log:

- `Both GOOGLE_API_KEY and GEMINI_API_KEY are set. Using GOOGLE_API_KEY.`
- `API key expired. Please renew the API key.`

Xu ly:

- Cap nhat key moi trong `.env` deploy.
- Recreate service `voice-agent`.
- Verify env thuc te trong container.

## 10.3 Co room nhung khong nghe thay tieng agent

Checklist:

- Da cap quyen microphone tren mobile.
- Da `setMicrophoneEnabled(true)` sau khi connect.
- LiveKit room co remote audio track cua agent.
- Thiet bi khong mute media volume.

## 11. Checklist release cho team mobile

Truoc khi release:

- [ ] Login + Bearer token hoat dong tren mobile.
- [ ] Goi duoc `/api/agents/livekit-token`.
- [ ] Connect duoc LiveKit room.
- [ ] Agent vao phong trong <= 5s (network tot).
- [ ] Mic user gui len thanh cong.
- [ ] Nghe duoc audio tu agent.
- [ ] Disconnect goi `/api/agents/livekit-end`.
- [ ] Xu ly cac state loi co UI thong bao ro rang.

## 12. Goi y cai thien tiep theo

- Them bloc/cubit de quan ly state voice session ro rang hon.
- Them reconnect strategy khi mang yeu.
- Them telemetry:
  - thoi gian connect
  - thoi gian cho agent vao phong
  - tong thoi gian session
  - ti le loi theo loai
- Dong bo graph runtime config tu backend qua mot endpoint config duy nhat de mobile khong hardcode.

---

Tai lieu nay phu hop voi luong Voice Agent token-based hien tai cua Torii (cap nhat 2026-04-09).
