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
    successPaginatedResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('enrollments')
@UseGuards(IdentityAuthGuard)
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
    async checkEnrollment(@Param('courseId') courseId: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.check' },
                    { courseId, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to check enrollment');
        }
    }

    @Post()
    async create(@Body() input: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.create' },
                    { ...input, userId: user.sub }
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
