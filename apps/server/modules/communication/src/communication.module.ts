import { Module } from '@nestjs/common';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule } from '@server/shared';

// Communication Feature Modules
import { NotificationModule } from './modules/notification/notification.module';
import { EmailModule } from './modules/email/email.module';
import { TicketModule } from './modules/ticket/ticket.module';

// Controllers
// import { NotificationController } from './controllers/notification.controller';
import { NotificationHandler } from '@server/communication/handlers/notification.handler';
import { EmailHandler } from '@server/communication/handlers/email.handler';
import { TicketHandler } from '@server/communication/handlers/ticket.handler';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    SharedModule,
    PrismaModule,

    // Communication Domain Modules
    NotificationModule,
    EmailModule,
    TicketModule,
  ],
  controllers: [
    // HTTP Controllers
    // NotificationController,
    // NATS Message Handlers
    NotificationHandler,
    EmailHandler,
    TicketHandler,
  ],
})
export class CommunicationModule { }
