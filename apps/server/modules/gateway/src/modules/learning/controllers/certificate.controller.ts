import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
    Inject,
    UsePipes,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    successPaginatedResponse,
    GatewayAuthGuard,
    Public,
    ZodValidationPipe,
    ReqWithRequester,
} from '@server/shared';
import {
    certificateQueryDTOSchema,
    type CertificateQueryDTO
} from '@workspace/schemas';

@Controller('api/certificates')
@UseGuards(GatewayAuthGuard)
export class CertificateController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('search')
    @UsePipes(new ZodValidationPipe(certificateQueryDTOSchema))
    async findAll(@Body() query: CertificateQueryDTO, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            query.userId = requester.sub;
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
    @Get(':id')
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

    @Public()
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
}
