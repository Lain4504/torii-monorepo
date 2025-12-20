# Quick Reference: NATS Microservices

## 🚀 Quick Start

### Start Infrastructure
```bash
# NATS Server
docker run --name nats -p 4222:4222 -p 8222:8222 nats:latest

# Start all services
cd apps/server
npm run dev
```

---

## 📝 Environment Variables

### Required
```bash
NATS_URL=nats://localhost:4222
GATEWAY_PORT=8080
```

### Optional (Production)
```bash
NATS_NKEY_SEED=your-nkey-seed
```

### ❌ Removed (No Longer Needed)
```bash
# All service HOST/PORT variables removed!
AUTH_HOST, AUTH_PORT
COURSE_HOST, COURSE_PORT
ROOM_PORT  # ← Room Service no longer needs port!
AI_HOST, AI_PORT
# ... etc
```

---

## 🏗️ Architecture

```
Client → Gateway:8080 → NATS:4222 → 8 Microservices
```

**Only Gateway has HTTP port. All services use NATS!**

---

## 💻 Code Patterns

### Microservice (Handler)
```typescript
// main.ts
import { createNatsServiceConfig } from '@server/shared';

const app = await NestFactory.createMicroservice(
  ServiceModule,
  createNatsServiceConfig(),
);

// controller.ts  
@MessagePattern({ cmd: 'service.action' })
handleAction(@Payload() data: any) {
  return this.service.doSomething(data);
}
```

### Gateway (Caller)
```typescript
// module.ts
import { NatsClientModule } from '@server/shared';

@Module({
  imports: [NatsClientModule],
})

// controller.ts
constructor(
  @Inject('NATS_SERVICE') private natsClient: ClientProxy,
) {}

@Post('action')
async action(@Body() data: any) {
  return firstValueFrom(
    this.natsClient.send({ cmd: 'service.action' }, data)
  );
}
```

---

## 🔄 Communication Types

### Request-Response (wait for result)
```typescript
const result = await firstValueFrom(
  this.natsClient.send({ cmd: 'auth.signin' }, credentials)
);
```

### Event Emission (fire-and-forget)
```typescript
this.natsClient.emit({ cmd: 'notification.send' }, notification);
```

---

## 📊 Service List

| # | Service | Port | Type |
|---|---------|------|------|
| 1 | Gateway | 8080 | HTTP + NATS Client |
| 2 | Auth | - | NATS Only |
| 3 | Course | - | NATS Only |
| 4 | Room | - | NATS Only |
| 5 | AI | - | NATS Only |
| 6 | Assessment | - | NATS Only |
| 7 | Payment | - | NATS Only |
| 8 | Notification | - | NATS Only |

---

## 🐛 Troubleshooting

### Can't connect to NATS
```bash
# Check NATS is running
docker ps | grep nats

# Check port is open
nc -zv localhost 4222

# View NATS connections
curl http://localhost:8222/connz
```

### Request timeout
- Verify target service is running
- Check message pattern matches exactly
- Ensure both use `{ cmd: 'exact.same.pattern' }`

### Build errors
```bash
# Rebuild specific service
nest build service-name

# Rebuild all
npm run build
```

---

## 📚 Full Documentation

- 📖 [`MIGRATION_COMPLETE.md`](./MIGRATION_COMPLETE.md) - Complete migration guide
- 🌍 [`ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md) - Env var details
- 💬 [`SERVICE_TO_SERVICE_COMMUNICATION.md`](./SERVICE_TO_SERVICE_COMMUNICATION.md) - Inter-service calling

---

## ✅ Key Benefits

- ✅ **No port management** - Just NATS
- ✅ **No port conflicts** - Services don't bind ports
- ✅ **Easy scaling** - Run multiple instances freely
- ✅ **Simple config** - 2 vars instead of 16+
- ✅ **Auto load balancing** - Built-in NATS feature

---

## 🎯 Message Pattern Convention

```
service.action
│       │
│       └─ Action name (camelCase)
└─ Service name (lowercase)
```

Examples:
- `auth.signin`
- `auth.signup`
- `course.create`
- `course.findAll`
- `poll.create`
- `poll.submit`

---

**That's it! Simple and powerful.** 🚀
