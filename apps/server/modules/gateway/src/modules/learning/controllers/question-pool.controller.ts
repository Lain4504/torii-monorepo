import {
    Controller,
    Get,
    Post,
    Patch,
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
} from '@server/shared';

@Controller('api/question-pools')
@UseGuards(GatewayAuthGuard)
export class QuestionPoolController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pools');
        }
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.findById' },
                    { id }
                )
            );
            return successResponse({ pool: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pool');
        }
    }

    @Get('course/:courseMasterId')
    async getByCourse(@Param('courseMasterId') courseMasterId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.getByCourse' },
                    { courseMasterId }
                )
            );
            return successResponse({ pools: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pools by course');
        }
    }

    @Get('lesson/:lessonId')
    async getByLesson(@Param('lessonId') lessonId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.getByLesson' },
                    { lessonId }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pools by lesson');
        }
    }

    @Get('jlpt-level/:jlptLevel')
    async getByJlptLevel(@Param('jlptLevel') jlptLevel: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.getByJlptLevel' },
                    { jlptLevel }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pools by JLPT level');
        }
    }

    @Post()
    async create(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.create' },
                    { ...dto, userId: requester.sub, userRole: requester.role, permissions: requester.permissions }
                )
            );
            return successResponse({ pool: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create question pool');
        }
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.update' },
                    { id, ...dto, userId: requester.sub, userRole: requester.role, permissions: requester.permissions }
                )
            );
            return successResponse({ pool: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update question pool');
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.delete' },
                    { id, userId: requester.sub, userRole: requester.role, permissions: requester.permissions }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete question pool');
        }
    }
}
