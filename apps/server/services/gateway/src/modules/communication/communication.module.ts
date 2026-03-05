import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { NotificationController } from './controllers/notification.controller';
import { TicketController } from './controllers/ticket.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [NotificationController, TicketController],
})
export class CommunicationModule {}
