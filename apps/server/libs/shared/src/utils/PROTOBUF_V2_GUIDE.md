# @bufbuild/protobuf v2 — Tài liệu tóm tắt (TypeScript)

## 1. @bufbuild/protobuf là gì?

`@bufbuild/protobuf` là thư viện Protocol Buffers cho TypeScript/JavaScript do **Buf** phát triển.

**Phiên bản:** v2 (API mới - standalone functions)

Đặc điểm:

* Tuân thủ chặt chẽ **proto3 specification**
* Thiết kế API hiện đại với **standalone functions**
* Type-safe với TypeScript generics
* Không sử dụng reflection runtime nặng
* Phù hợp cho môi trường:
  * Node.js
  * Browser
  * Edge runtime
* Thường được sử dụng cùng:
  * `buf` CLI
  * `@bufbuild/protoc-gen-es`

---

## 2. Khái niệm cốt lõi

Sau khi generate từ file `.proto`:

* Mỗi `message` được sinh ra dưới dạng **TypeScript type**
* Mỗi message có một **Schema** tương ứng
* Sử dụng **standalone functions** từ `@bufbuild/protobuf` để thao tác

Ví dụ import:

```ts
import { 
  CommonResponse,           // Type definition
  CommonResponseSchema      // Schema for runtime
} from '@workspace/protocol';
import { create, toBinary, fromBinary, toJson, fromJson } from '@bufbuild/protobuf';
```

---

## 3. Tạo Message (Create)

### 3.1 Cú pháp v2

```ts
import { create } from '@bufbuild/protobuf';
import { CommonResponse, CommonResponseSchema } from '@workspace/protocol';

const msg = create(CommonResponseSchema, {
  status: true,
  msg: 'ok',
});
```

**Quy tắc:**
* ✅ LUÔN dùng `create(Schema, {...})`
* ❌ KHÔNG dùng `new Message({...})` (v1)
* ✅ Schema là parameter đầu tiên
* ✅ Data object là parameter thứ hai

Tương đương Go:

```go
msg := &CommonResponse{
  Status: true,
  Msg:    "ok",
}
```

---

## 4. Protobuf Binary (Wire Format)

### 4.1 Serialize (Marshal)

```ts
import { toBinary } from '@bufbuild/protobuf';

const bytes = toBinary(CommonResponseSchema, msg);  // Uint8Array
```

**Đặc điểm:**
* Kết quả là protobuf **binary wire format**
* Dùng cho gRPC hoặc HTTP binary
* Schema là parameter đầu tiên
* Message là parameter thứ hai

Tương đương Go:

```go
bytes, _ := proto.Marshal(msg)
```

---

### 4.2 Deserialize (Unmarshal)

```ts
import { fromBinary } from '@bufbuild/protobuf';

const decoded = fromBinary(CommonResponseSchema, bytes);
```

**Đặc điểm:**
* Parse `Uint8Array` → protobuf message
* Tự động validate wire format
* Schema là parameter đầu tiên
* Bytes là parameter thứ hai

Tương đương Go:

```go
var msg CommonResponse
proto.Unmarshal(bytes, &msg)
```

---

## 5. Protobuf JSON (proto3 JSON mapping)

### 5.1 Serialize → JSON

```ts
import { toJson } from '@bufbuild/protobuf';

const json = toJson(CommonResponseSchema, msg);
```

**Đặc điểm:**
* Output là JSON object
* Tuân theo **proto3 JSON mapping**
* Enum, wrapper types, timestamp được xử lý đúng chuẩn
* Field names chuyển sang camelCase
* Omit default values (optional)

Tương đương Go:

```go
bytes, _ := protojson.Marshal(msg)
```

---

### 5.2 Deserialize từ JSON

```ts
import { fromJson } from '@bufbuild/protobuf';

const decoded = fromJson(CommonResponseSchema, json);
```

**Đặc điểm:**
* Parse JSON → protobuf message
* Kiểm tra type và cấu trúc dữ liệu
* Hỗ trợ cả snake_case và camelCase field names

Tương đương Go:

```go
var msg CommonResponse
protojson.Unmarshal(jsonBytes, &msg)
```

---

### 5.3 Serialize → JSON String

```ts
import { toJsonString } from '@bufbuild/protobuf';

const jsonStr = toJsonString(CommonResponseSchema, msg);  // string
```

**Đặc điểm:**
* Output là JSON string (không phải object)
* Tiện cho logging hoặc HTTP response

---

## 6. Mapping API Go ↔ TypeScript v2

| Go protobuf API | @bufbuild/protobuf v2 |
|-----------------|------------------------|
| `&Message{...}` | `create(Schema, {...})` |
| `proto.Marshal(msg)` | `toBinary(Schema, msg)` |
| `proto.Unmarshal(bytes, &msg)` | `fromBinary(Schema, bytes)` |
| `protojson.Marshal(msg)` | `toJson(Schema, msg)` |
| `protojson.Unmarshal(json, &msg)` | `fromJson(Schema, json)` |

---

## 7. Type Mappings: Protobuf ↔ TypeScript

| Protobuf Type | TypeScript Type | Ghi chú |
|---------------|-----------------|---------|
| `bool` | `boolean` | |
| `string` | `string` | |
| `bytes` | `Uint8Array` | |
| `int32`, `sint32`, `sfixed32` | `number` | |
| `uint32`, `fixed32` | `number` | |
| `int64`, `sint64`, `sfixed64` | `bigint` hoặc `string` | Tùy `jstype` |
| `uint64`, `fixed64` | `bigint` hoặc `string` | **Nếu `jstype = JS_STRING` → `string`** |
| `float`, `double` | `number` | |
| `enum` | `number` | Enum value |
| `message` | `MessageType` | Generated type |
| `repeated T` | `T[]` | Array |
| `map<K, V>` | `{ [key: K]: V }` | Object |
| `optional T` | `T \| undefined` | |

**⚠️ Quan trọng:** 
* `uint64` và `int64` với `jstype = JS_STRING` → **type là `string`**, KHÔNG phải `bigint`
* Ví dụ: `uint64 created_at = 1 [jstype = JS_STRING];` → TypeScript type: `string`

---

## 8. Nested Messages

```ts
import { create } from '@bufbuild/protobuf';
import { 
  CreateRoomReq, 
  CreateRoomReqSchema,
  RoomMetadata,
  RoomMetadataSchema,
} from '@workspace/protocol';

// Nested message phải dùng create() cho TẤT CẢ levels
const req = create(CreateRoomReqSchema, {
  roomId: 'my-room',
  metadata: create(RoomMetadataSchema, {
    roomTitle: 'My Room',
    isRecording: false,
    isActiveRtmp: false,
    // ...
  }),
});
```

**Quy tắc:**
* ✅ Mọi nested message object phải dùng `create()`
* ❌ KHÔNG được dùng inline object literal cho nested messages
* ❌ KHÔNG được dùng `{...}` trực tiếp cho message type

**Lý do:** Protobuf messages cần property `$typeName` để runtime validation và serialization.

---

## 9. Complete Example: Clone từ Go

### Go Code:

```go
package main

import (
    "github.com/mynaparrot/plugnmeet-protocol/plugnmeet"
    "google.golang.org/protobuf/proto"
    "google.golang.org/protobuf/encoding/protojson"
)

func main() {
    // Create message
    msg := &plugnmeet.CommonResponse{
        Status: true,
        Msg:    "Success",
    }
    
    // Serialize to binary
    bytes, _ := proto.Marshal(msg)
    
    // Deserialize from binary
    var decoded plugnmeet.CommonResponse
    proto.Unmarshal(bytes, &decoded)
    
    // Serialize to JSON
    jsonBytes, _ := protojson.Marshal(msg)
    
    // Deserialize from JSON
    var fromJson plugnmeet.CommonResponse
    protojson.Unmarshal(jsonBytes, &fromJson)
}
```

### TypeScript v2 Equivalent:

```ts
import { create, toBinary, fromBinary, toJson, fromJson } from '@bufbuild/protobuf';
import { CommonResponse, CommonResponseSchema } from '@workspace/protocol';

// Create message
const msg = create(CommonResponseSchema, {
  status: true,
  msg: 'Success',
});

// Serialize to binary
const bytes = toBinary(CommonResponseSchema, msg);

// Deserialize from binary
const decoded = fromBinary(CommonResponseSchema, bytes);

// Serialize to JSON
const json = toJson(CommonResponseSchema, msg);

// Deserialize from JSON
const fromJsonMsg = fromJson(CommonResponseSchema, json);
```

---

## 10. Best Practices

### ✅ DO:

1. **Luôn import Schema cùng với Type:**
   ```ts
   import { CommonResponse, CommonResponseSchema } from '@workspace/protocol';
   ```

2. **Dùng `create()` cho mọi message:**
   ```ts
   const msg = create(MessageSchema, {...});
   ```

3. **Dùng standalone functions với Schema:**
   ```ts
   toBinary(Schema, msg)
   fromBinary(Schema, bytes)
   toJson(Schema, msg)
   fromJson(Schema, json)
   ```

4. **Nested messages cũng dùng `create()`:**
   ```ts
   const parent = create(ParentSchema, {
     child: create(ChildSchema, {...}),
   });
   ```

### ❌ DON'T:

1. **KHÔNG dùng `new Message({})`** (v1 API)
2. **KHÔNG dùng inline object cho nested messages:**
   ```ts
   // ❌ SAI
   const parent = create(ParentSchema, {
     child: {...},  // Missing $typeName!
   });
   ```

3. **KHÔNG dùng instance methods** (v1 API):
   ```ts
   // ❌ SAI
   msg.toBinary()      // v1
   msg.toJson()        // v1
   ```

---

## 11. Type Safety với uint64 / int64

**Quy tắc quan trọng:**

```protobuf
// Proto definition
message Example {
  uint64 timestamp1 = 1;                      // → TypeScript: bigint
  uint64 timestamp2 = 2 [jstype = JS_STRING]; // → TypeScript: string
}
```

```ts
// TypeScript
const msg = create(ExampleSchema, {
  timestamp1: 123456789n,        // bigint
  timestamp2: '123456789',       // string (with JS_STRING)
});
```

**⚠️ Luôn check proto definition để biết type chính xác!**

---

## 12. Common Patterns

### Pattern 1: HTTP Response (Binary)

```ts
import { Response } from 'express';
import { toBinary } from '@bufbuild/protobuf';
import { CommonResponseSchema } from '@workspace/protocol';

function sendProtobufResponse(res: Response, msg: any, schema: any) {
  const bytes = toBinary(schema, msg);
  res.setHeader('Content-Type', 'application/protobuf');
  res.send(Buffer.from(bytes));
}

// Usage
const response = create(CommonResponseSchema, {status: true, msg: 'ok'});
sendProtobufResponse(res, response, CommonResponseSchema);
```

### Pattern 2: HTTP Response (JSON)

```ts
import { Response } from 'express';
import { toJson } from '@bufbuild/protobuf';

function sendProtoJsonResponse(res: Response, msg: any, schema: any) {
  const json = toJson(schema, msg);
  res.setHeader('Content-Type', 'application/json');
  res.json(json);
}
```

### Pattern 3: Parse Request Body

```ts
import { Request } from 'express';
import { fromBinary } from '@bufbuild/protobuf';
import { CreateRoomReqSchema } from '@workspace/protocol';

function parseProtobufRequest(req: Request) {
  const bytes = new Uint8Array(req.body);
  return fromBinary(CreateRoomReqSchema, bytes);
}
```

---

**Kết thúc tài liệu @bufbuild/protobuf v2.**
