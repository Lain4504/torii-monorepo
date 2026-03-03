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
    ReqWithRequester,
} from '@server/shared';
import { CreateTicketDTO, TicketQueryDTO, UpdateTicketStatusDTO } from '@workspace/schemas';

@Controller('api/tickets')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class TicketController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createTicket(@Body() dto: CreateTicketDTO, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'communication.ticket.create' },
                { userId: requester.sub, dto }
            )
        );
        return successResponse(result, 'Ticket submitted successfully');
    }

    @Get()
    async getTickets(@Query() query: TicketQueryDTO, @Req() req: ReqWithRequester) {
        const requester = req.requester;

        // Learners can only see their own tickets
        if (requester.role === 'learner') {
            query.userId = requester.sub;
        }

        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'communication.ticket.findAll' }, query)
        );
        return successPaginatedResponse(result);
    }

    @Get('stats')
    @Permissions('support.view')
    async getTicketStats() {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'communication.analytics.tickets' }, {})
        );
        return successResponse(result);
    }

    @Get(':id')
    async getTicket(@Param('id') id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'communication.ticket.findById' }, { id })
        );
        return successResponse(result);
    }

    @Patch(':id/status')
    @Permissions('support.handle')
    async updateTicketStatus(
        @Param('id') id: string,
        @Body() dto: UpdateTicketStatusDTO,
        @Req() req: ReqWithRequester
    ) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'communication.ticket.updateStatus' },
                { id, handlerId: requester.sub, dto }
            )
        );
        return successResponse(result, 'Ticket status updated successfully');
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post(':id/delete') // Or @Delete(':id') but let's use @Post(':id/delete') if they prefer or standard @Delete
    async deleteTicket(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        await firstValueFrom(
            this.natsClient.send(
                { cmd: 'communication.ticket.delete' },
                { id, userId: requester.sub }
            )
        );
        return successResponse(null, 'Ticket deleted successfully');
    }
}
