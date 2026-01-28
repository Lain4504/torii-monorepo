import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule } from '@server/shared';

// Communication Feature Modules
import { NotificationModule } from './modules/notification/notification.module';
import { EmailModule } from './modules/email/email.module';
import { TicketModule } from './modules/ticket/ticket.module';

// Controllers
// import { NotificationController } from './controllers/notification.controller';
import { NotificationHandler } from './interfaces/nats/notification.handler';
import { EmailHandler } from './interfaces/nats/email.handler';
import { TicketHandler } from './interfaces/nats/ticket.handler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
