import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { TicketService } from './ticket.service';
import { RefundService } from './refund.service';
import { TicketRepository } from './ticket.repository';
import { TicketHandler } from './ticket.handler';
import { RefundHandler } from './refund.handler';
import { TICKET_SERVICE_TOKEN } from '@server/academy/interfaces/services';
import { TICKET_REPOSITORY_TOKEN } from '@server/academy/interfaces/repositories';
import { EmailModule } from '@server/identity/modules/email/email.module';

@Module({
  imports: [PrismaModule, NatsClientModule, EmailModule],
  controllers: [TicketHandler, RefundHandler],
  providers: [
    {
      provide: TICKET_REPOSITORY_TOKEN,
      useClass: TicketRepository,
    },
    {
      provide: TICKET_SERVICE_TOKEN,
      useClass: TicketService,
    },
    RefundService,
  ],
  exports: [TICKET_SERVICE_TOKEN, RefundService],
})
export class TicketModule { }
