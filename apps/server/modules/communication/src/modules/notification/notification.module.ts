import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationController } from './notification.controller';
import { NOTIFICATION_SERVICE_TOKEN } from '../../interfaces/services';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../interfaces/repositories';

/**
 * Notification Feature Module
 * Handles notification operations
 */
@Module({
  imports: [PrismaModule, NatsClientModule, ConfigModule],
  controllers: [NotificationController],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useClass: NotificationRepository,
    },
    {
      provide: NOTIFICATION_SERVICE_TOKEN,
      useClass: NotificationService,
    },
  ],
  exports: [NOTIFICATION_SERVICE_TOKEN],
})
export class NotificationModule { }
