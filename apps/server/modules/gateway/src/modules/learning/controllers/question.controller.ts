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

@Controller('api/questions')
@UseGuards(GatewayAuthGuard)
export class QuestionController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch questions');
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.findOne' },
                    { id }
                )
            );
            return successResponse({ question: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question');
        }
    }

    @Get('category/:category')
    async getByCategory(@Param('category') category: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.getByCategory' },
                    { category }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch questions by category');
        }
    }

    @Get('jlpt-level/:jlptLevel')
    async getByJlptLevel(@Param('jlptLevel') jlptLevel: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.getByJlptLevel' },
                    { jlptLevel }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch questions by JLPT level');
        }
    }

    @Get('status/:status')
    async getByStatus(@Param('status') status: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.getByStatus' },
                    { status }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch questions by status');
        }
    }

    @Get('pool/:poolId')
    async getByPool(@Param('poolId') poolId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.getByPool' },
                    { poolId }
                )
            );
            return successResponse({ questions: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch questions by pool');
        }
    }

    @Post()
    async create(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.create' },
                    { ...dto, requester: req.requester }
                )
            );
            return successResponse({ question: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create question');
        }
    }

    @Post('bulk')
    async createMany(@Body() dtos: any[], @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.createMany' },
                    { dtos, requester: req.requester }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create questions');
        }
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.update' },
                    { id, ...dto, requester: req.requester }
                )
            );
            return successResponse({ question: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update question');
        }
    }

    @Patch('bulk/update')
    async updateMany(@Body() body: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.updateMany' },
                    { questionIds: body.questionIds, dto: body.data, requester: req.requester }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update questions');
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.delete' },
                    { id, requester: req.requester }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete question');
        }
    }

    @Delete('bulk/delete')
    async deleteMany(@Body() body: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.deleteMany' },
                    { questionIds: body.questionIds, requester: req.requester }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete questions');
        }
    }

    @Post(':id/approve')
    async approve(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.approve' },
                    { id, requester: req.requester }
                )
            );
            return successResponse({ question: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to approve question');
        }
    }

    @Post(':id/deactivate')
    async deactivate(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.deactivate' },
                    { id, requester: req.requester }
                )
            );
            return successResponse({ question: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to deactivate question');
        }
    }

    @Post(':id/reject')
    async reject(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.reject' },
                    { id, requester: req.requester }
                )
            );
            return successResponse({ question: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to reject question');
        }
    }

    @Post(':id/review')
    async sendForReview(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question.sendForReview' },
                    { id, requester: req.requester }
                )
            );
            return successResponse({ question: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to send question for review');
        }
    }
}
