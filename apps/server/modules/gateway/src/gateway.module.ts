import { Module } from '@nestjs/common';

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

@Module({
  imports: [

    AuthModule,
    CourseModule,
    SharedModule,
    NatsAuthModule, // Auth callout handler - only in Gateway
    RoomModule,
    FileModule,
    AdminModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService, ApiKeyGuard, SystemWorkerService],
})
export class GatewayModule { }

