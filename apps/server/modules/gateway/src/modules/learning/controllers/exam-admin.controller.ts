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
    successPaginatedResponse,
    GatewayAuthGuard,
    ReqWithRequester,
    ZodValidationPipe,
} from '@server/shared';
import { examQueryDTOSchema, examSessionQueryDTOSchema } from '@workspace/schemas';
import type { ExamQueryDTO, ExamSessionQueryDTO } from '@workspace/schemas';

@Controller('api/admin/exams')
@UseGuards(GatewayAuthGuard)
export class ExamAdminController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('search')
    async findAll(@Body(new ZodValidationPipe(examQueryDTOSchema)) query: ExamQueryDTO) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exams');
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.findOne' },
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
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.create' },
                    { ...dto, userId: requester.sub, userRole: requester.role }
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
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.update' },
                    { id, ...dto, userId: requester.sub, userRole: requester.role }
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
            const requester = req.requester;
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.delete' },
                    { id, userId: requester.sub, userRole: requester.role }
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
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.publish' },
                    { id, userId: requester.sub, userRole: requester.role }
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

    @Post(':id/attempts/search')
    async getQuizAttempts(@Param('id') id: string, @Body(new ZodValidationPipe(examSessionQueryDTOSchema)) query: ExamSessionQueryDTO) {
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
