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
    errorResponse
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
            return successResponse(result);
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
            return successResponse(result);
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
            // The original controller returned { isEnrolled: boolean, enrollment?: ... }
            // NATS handler returns the same.
            // successResponse wraps it in { data: ... }
            return result; // Returning directly to match expected structure? Or wrap? 
            // Original: return { isEnrolled: ... }
            // Gateway usually returns successResponse(result).
            // Let's stick to successResponse(result) which returns { success: true, data: result }
            // If the FE expects { isEnrolled: ... } directly at root, we might need adjustment.
            // But usually API returns standard response. Let's wrap it.
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
            return successResponse(result);
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
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update progress');
        }
    }
}
