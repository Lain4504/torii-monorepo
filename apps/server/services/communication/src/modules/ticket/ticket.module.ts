import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { TicketHandler } from './ticket.handler';
import { TICKET_SERVICE_TOKEN } from '@server/communication/interfaces/services';
import { TICKET_REPOSITORY_TOKEN } from '@server/communication/interfaces/repositories';
import { NotificationModule } from '@server/communication/modules/notification/notification.module';
import { EmailModule } from '@server/communication/modules/email/email.module';

@Module({
    imports: [PrismaModule, NatsClientModule, NotificationModule, EmailModule],
    controllers: [TicketHandler],
    providers: [
        {
            provide: TICKET_REPOSITORY_TOKEN,
            useClass: TicketRepository,
        },
        {
            provide: TICKET_SERVICE_TOKEN,
            useClass: TicketService,
        },
    ],
    exports: [TICKET_SERVICE_TOKEN],
})
export class TicketModule { }
