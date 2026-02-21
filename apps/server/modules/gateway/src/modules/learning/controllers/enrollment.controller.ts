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

    @Get('check-gift')
    async checkGiftRecipient(
        @Query('email') email: string,
        @Query('courseId') courseId: string
    ) {
        try {
            // 1. Find user by email using the existing findAll endpoint with search
            const identityResponse = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.users.findAll' },
                    { search: email, limit: 1, page: 1 }
                )
            );

            const user = identityResponse?.data?.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                return successResponse({
                    isRegistered: false,
                    isEnrolled: false,
                });
            }

            // 2. Check enrollment if user exists
            const isEnrolled = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.isEnrolled' },
                    { courseId, userId: user.id }
                )
            );

            return successResponse({
                isRegistered: true,
                isEnrolled,
            });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to check gift recipient');
        }
    }

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


    @Post('upgrade/:courseId')
    async upgradeVersion(@Param('courseId') courseId: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.enrollment.upgradeVersion' },
                    { courseId, userId: requester.sub }
                )
            );
            return successResponse({ enrollment: result }, 'Successfully upgraded to latest version');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to upgrade enrollment version');
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
