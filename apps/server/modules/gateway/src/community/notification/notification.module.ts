import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';

import { NotificationController } from './notification.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [NotificationController],
})
export class NotificationModule {}



