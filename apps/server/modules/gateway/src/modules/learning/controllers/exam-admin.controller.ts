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
    errorResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('admin/exams')
@UseGuards(IdentityAuthGuard)
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
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.findOne' },
                    { id }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exam');
        }
    }

    @Post()
    async create(@Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.create' },
                    { ...dto, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create exam');
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.update' },
                    { id, ...dto, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update exam');
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.delete' },
                    { id, userId: user.sub }
                )
            );
            return successResponse({ message: 'Exam deleted successfully' });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete exam');
        }
    }

    @Post(':id/publish')
    async publish(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam-admin.publish' },
                    { id, userId: user.sub }
                )
            );
            return successResponse(result);
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
            return successResponse(result);
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
