import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    successPaginatedResponse,
    GatewayAuthGuard,
} from '@server/shared';

@Controller('api/certificates')
export class CertificateController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    @UseGuards(GatewayAuthGuard)
    async findAll(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.certificate.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch certificates');
        }
    }

    @Get('verify/:code')
    async verify(@Param('code') code: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.certificate.verify' },
                    { code }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to verify certificate');
        }
    }

    @Get(':id')
    @UseGuards(GatewayAuthGuard)
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.certificate.findOne' },
                    { id }
                )
            );
            return successResponse({ certificate: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch certificate');
        }
    }
}
