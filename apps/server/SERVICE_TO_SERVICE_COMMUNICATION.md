# Service-to-Service Communication Guide

## 🎯 How Services Can Communicate

With NATS, any service can easily call another service. Here's how:

---

## 📦 Setup: Enable Service-to-Service Communication

### Option 1: Import NatsClientModule (Recommended)

In any service module that needs to call other services:

```typescript
// Example: course-service.module.ts
import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared'; // Add this
import { CourseController } from './course/course.controller';
import { CourseService } from './course/course.service';

@Module({
  imports: [
    NatsClientModule, // ✅ Now can call other services!
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseServiceModule {}
```

### Option 2: Inject NATS Client in Service

```typescript
// Example: course.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CourseService {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async validateUserToken(token: string) {
    // Call Auth Service from Course Service! 🚀
    return firstValueFrom(
      this.natsClient.send({ cmd: 'auth.validate-token' }, { token })
    );
  }

  async create(data: any) {
    // Validate token before creating course
    const isValid = await this.validateUserToken(data.token);
    
    if (!isValid) {
      throw new Error('Invalid token');
    }

    // Create course logic...
  }
}
```

---

## 🔄 Communication Patterns

### 1. Request-Response (Synchronous)

**Use Case:** Get data from another service

```typescript
// Course Service calls Auth Service
const user = await firstValueFrom(
  this.natsClient.send({ cmd: 'auth.getUser' }, { userId: 123 })
);
```

### 2. Event-Driven (Asynchronous)

**Use Case:** Notify other services without waiting

```typescript
// Course Service emits event (fire-and-forget)
this.natsClient.emit({ cmd: 'notification.sendEmail' }, {
  to: 'user@email.com',
  subject: 'New Course Available',
});
```

---

## 📊 Real-World Examples

### Example 1: Course Service → Auth Service

```typescript
// apps/server/modules/course-service/src/course/course.service.ts
@Injectable()
export class CourseService {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly prisma: PrismaService,
  ) {}

  async enrollUser(courseId: number, token: string) {
    // Step 1: Validate token via Auth Service
    const user = await firstValueFrom(
      this.natsClient.send({ cmd: 'auth.validate-token' }, { token })
    );

    if (!user.isValid) {
      throw new UnauthorizedException();
    }

    // Step 2: Enroll user in course
    const enrollment = await this.prisma.enrollment.create({
      data: {
        courseId,
        userId: user.userId,
      },
    });

    // Step 3: Notify user via Notification Service
    this.natsClient.emit({ cmd: 'notification.sendEmail' }, {
      userId: user.userId,
      template: 'course-enrollment',
      data: { courseName: enrollment.course.title },
    });

    return enrollment;
  }
}
```

### Example 2: Auth Service → Notification Service

```typescript
// apps/server/modules/auth-service/src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly supabase: SupabaseClient,
  ) {}

  async signUp(data: SignUpDto) {
    // Create user
    const { data: user, error } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    // Send welcome email via Notification Service
    this.natsClient.emit({ cmd: 'notification.sendWelcomeEmail' }, {
      userId: user.id,
      email: data.email,
    });

    return user;
  }
}
```

### Example 3: Payment Service → Course Service → Notification Service

```typescript
// Payment Service calls multiple services
@Injectable()
export class PaymentService {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async processPayment(data: PaymentDto) {
    // 1. Enroll user in course (Course Service)
    const enrollment = await firstValueFrom(
      this.natsClient.send({ cmd: 'course.enroll' }, {
        userId: data.userId,
        courseId: data.courseId,
      })
    );

    // 2. Send receipt (Notification Service)
    this.natsClient.emit({ cmd: 'notification.sendReceipt' }, {
      userId: data.userId,
      amount: data.amount,
      courseName: enrollment.courseName,
    });

    // 3. Update user stats (Auth/User Service)
    this.natsClient.emit({ cmd: 'user.incrementCourseCount' }, {
      userId: data.userId,
    });

    return { success: true, enrollment };
  }
}
```

---

## 🏗️ Architecture Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────────────┐
│      GATEWAY (8080)         │
│  • HTTP/REST API            │
│  • WebSocket                │
│  • GraphQL (optional)       │
└──────┬──────────────────────┘
       │ NATS
       ▼
┌────────────────────────────────────────┐
│          NATS MESSAGE BUS              │
│      (localhost:4222)                  │
└─┬─────┬─────┬──────┬──────┬──────┬────┘
  │     │     │      │      │      │
  ▼     ▼     ▼      ▼      ▼      ▼
┌───┐ ┌───┐ ┌───┐ ┌────┐ ┌────┐ ┌────┐
│AUTH│ │CRS│ │ROOM│ │ AI │ │PAY │ │NOT │
└─┬─┘ └─┬─┘ └─┬──┘ └──┬─┘ └──┬─┘ └──┬─┘
  │     │     │       │      │      │
  └─────┴─────┴───────┴──────┴──────┘
      All can call each other! 🔄
```

---

## ✅ Benefits of Service-to-Service Communication

1. **Decoupling**: Services don't need to know each other's location
2. **Scalability**: Can spawn multiple instances of any service
3. **Resilience**: NATS handles reconnection automatically
4. **Flexibility**: Easy to add/remove services
5. **Observability**: All messages flow through NATS (can monitor)

---

## 🚀 Quick Start

### 1. Add NatsClientModule to Any Service

```typescript
// apps/server/modules/course-service/src/course-service.module.ts
import { NatsClientModule } from '@server/shared';

@Module({
  imports: [NatsClientModule], // Add this line
  // ... rest of config
})
export class CourseServiceModule {}
```

### 2. Inject NATS Client in Service/Controller

```typescript
constructor(
  @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
) {}
```

### 3. Call Other Services

```typescript
// Synchronous (wait for response)
const result = await firstValueFrom(
  this.natsClient.send({ cmd: 'service.action' }, data)
);

// Asynchronous (fire and forget)
this.natsClient.emit({ cmd: 'service.action' }, data);
```

---

## 🎯 Best Practices

1. **Use `.send()` when you need a response**
   - Authentication checks
   - Data queries
   - Validation

2. **Use `.emit()` for notifications**
   - Sending emails
   - Logging events
   - Analytics tracking

3. **Handle errors properly**
   ```typescript
   try {
     const result = await firstValueFrom(
       this.natsClient.send({ cmd: 'service.action' }, data)
     );
   } catch (error) {
     // Handle timeout or service unavailable
   }
   ```

4. **Set timeouts for critical calls**
   ```typescript
   const result = await firstValueFrom(
     this.natsClient.send({ cmd: 'service.action' }, data)
       .pipe(timeout(5000)) // 5 second timeout
   );
   ```

---

## 🔒 Security Note

When services call each other, validate tokens/permissions:

```typescript
async someAction(data: any) {
  // Always validate caller's permissions
  const isAuthorized = await this.validatePermission(data.token);
  
  if (!isAuthorized) {
    throw new UnauthorizedException();
  }
  
  // Proceed with action
}
```

---

## ✅ Summary

**YES, services can EASILY communicate with each other!**

Just:
1. Import `NatsClientModule` in any service
2. Inject `NATS_SERVICE` client
3. Use `.send()` or `.emit()`

All services are connected via NATS - any can talk to any! 🚀
