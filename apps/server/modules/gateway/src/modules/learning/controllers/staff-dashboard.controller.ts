import {
    Controller,
    Get,
    UseGuards,
    Req,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';
import { Request } from 'express';

@Controller('api/staff/dashboard')
@UseGuards(GatewayAuthGuard)
export class StaffDashboardController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async getDashboardMetrics(@Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.staff-dashboard.getMetrics' },
                    { userId: user.sub, role: user.role }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch dashboard metrics');
        }
    }
}
