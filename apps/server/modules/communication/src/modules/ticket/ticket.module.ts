import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { TicketHandler } from '../../interfaces/nats/ticket.handler';
import { TICKET_SERVICE_TOKEN } from '../../interfaces/services';
import { TICKET_REPOSITORY_TOKEN } from '../../interfaces/repositories';

@Module({
    imports: [PrismaModule, NatsClientModule],
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
