import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Inject,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    successResponse,
    successPaginatedResponse,
} from '@server/shared';
import { Request } from 'express';
import { CreateTicketDTO, TicketQueryDTO, UpdateTicketStatusDTO, Requester } from '@workspace/schemas';

interface RequestWithUser extends Request {
    user: Requester & { email: string };
}

@Controller('api/tickets')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class TicketController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createTicket(@Body() dto: CreateTicketDTO, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'communication.ticket.create' },
                { userId: user.sub, dto }
            )
        );
        return successResponse(result, 'Ticket submitted successfully');
    }

    @Get()
    async getTickets(@Query() query: TicketQueryDTO, @Req() req: RequestWithUser) {
        const user = req.user;

        // Learners can only see their own tickets
        if (user.role === 'learner') {
            query.userId = user.sub;
        }

        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'communication.ticket.findAll' }, query)
        );
        return successPaginatedResponse(result);
    }

    @Get(':id')
    async getTicket(@Param('id') id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'communication.ticket.findOne' }, { id })
        );
        return successResponse(result);
    }

    @Patch(':id/status')
    @Permissions('support.handle')
    async updateTicketStatus(
        @Param('id') id: string,
        @Body() dto: UpdateTicketStatusDTO,
        @Req() req: RequestWithUser
    ) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'communication.ticket.updateStatus' },
                { id, handlerId: user.sub, dto }
            )
        );
        return successResponse(result, 'Ticket status updated successfully');
    }
}
