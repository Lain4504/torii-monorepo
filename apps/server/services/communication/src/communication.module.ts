import { Module } from '@nestjs/common';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule } from '@server/shared';

// Communication Feature Modules
import { NotificationModule } from '@server/communication/modules/notification/notification.module';
import { EmailModule } from '@server/communication/modules/email/email.module';
import { TicketModule } from '@server/communication/modules/ticket/ticket.module';

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
    // HTTP Controllers (registered at root level if needed)
    // NotificationController,
  ],
})
export class CommunicationModule { }
