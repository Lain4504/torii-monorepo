import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Query,
    Body,
    UseGuards,
    Req,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    successPaginatedResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/enrollments')
@UseGuards(GatewayAuthGuard)
export class EnrollmentController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch enrollments');
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.findOne' },
                    { id }
                )
            );
            return successResponse({ enrollment: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch enrollment');
        }
    }

    @Get('check/:courseId')
    async checkEnrollment(@Param('courseId') courseId: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.check' },
                    { courseId, userId: requester.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to check enrollment');
        }
    }

    @Post()
    async create(@Body() input: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.create' },
                    { ...input, userId: requester.sub }
                )
            );
            return successResponse({ enrollment: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create enrollment');
        }
    }

    @Patch(':id/progress')
    async updateProgress(
        @Param('id') id: string,
        @Body('completionPercentage') completionPercentage: number
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.updateProgress' },
                    { id, completionPercentage }
                )
            );
            return successResponse({ enrollment: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update progress');
        }
    }
}
