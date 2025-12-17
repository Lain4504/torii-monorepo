import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

import { CourseModule } from './course/course.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule, NatsAuthModule } from '@server/shared';
import { RoomModule } from './room/room.module';
import { FileModule } from './file/file.module';
import { AdminModule } from './admin/admin.module';

import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ApiKeyGuard } from '@server/shared/guards/api-key.guard';
import { SystemWorkerService } from './system-worker.service';
import { UserTrackingService } from './user-tracking.service';
import { NatsConnectionListener } from './nats-connection-listener.service';
import { WebhookController } from './room/webhook.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ROOM_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      },
    ]),
    AuthModule,
    CourseModule,
    SharedModule,
    NatsAuthModule, // Auth callout handler - only in Gateway
    RoomModule,
    FileModule,
    AdminModule,
  ],
  controllers: [GatewayController, WebhookController],
  providers: [
    GatewayService,
    ApiKeyGuard,
    SystemWorkerService,
    UserTrackingService,
    NatsConnectionListener, // Matches Go: subscribeToUsersConnEvents
  ],
  exports: [UserTrackingService],
})
export class GatewayModule {}

