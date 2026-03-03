import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/admin/exams')
@UseGuards(GatewayAuthGuard)
export class ExamAdminController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.findAll' },
                    query
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exams');
        }
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.findById' },
                    { id }
                )
            );
            return successResponse({ exam: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exam');
        }
    }

    @Post()
    async create(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.create' },
                    { ...dto, requester: req.requester }
                )
            );
            return successResponse({ exam: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create exam');
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.update' },
                    { id, ...dto, requester: req.requester }
                )
            );
            return successResponse({ exam: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update exam');
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.delete' },
                    { id, requester: req.requester }
                )
            );
            return successResponse(null, 'Exam deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete exam');
        }
    }

    @Post(':id/publish')
    async publish(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.publish' },
                    { id, requester: req.requester }
                )
            );
            return successResponse({ exam: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to publish exam');
        }
    }

    @Get(':id/stats')
    async getStats(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.getStats' },
                    { id }
                )
            );
            return successResponse(result); // Stats can be direct object or { stats: ... }? Let's keep direct for arbitrary stats object
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exam stats');
        }
    }

    @Get(':id/attempts')
    async getQuizAttempts(@Param('id') id: string, @Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.getQuizAttempts' },
                    { id, query }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exam attempts');
        }
    }
}
