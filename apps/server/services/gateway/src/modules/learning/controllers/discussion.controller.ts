import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
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
    Public,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';
import {
    DiscussionTopicCreateDTO,
    DiscussionTopicQueryDTO,
    DiscussionTopicUpdateDTO,
} from '@workspace/schemas';

@Controller('api/discussions')
@UseGuards(GatewayAuthGuard)
export class DiscussionController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Public()
    @Get()
    async findAll(@Query() query: DiscussionTopicQueryDTO, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'discussion.findAll',
                    { query, userId: requester?.sub }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch discussions');
        }
    }

    @Public()
    @Get(':id')
    async findById(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'discussion.findById',
                    { id, userId: requester?.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch discussion');
        }
    }

    @Post()
    async create(@Body() dto: DiscussionTopicCreateDTO, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'discussion.create',
                    { dto, userId: requester?.sub }
                )
            );
            return successResponse(result, 'Discussion created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create discussion');
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: DiscussionTopicUpdateDTO,
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'discussion.update',
                    { id, dto, userId: requester?.sub }
                )
            );
            return successResponse(result, 'Discussion updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update discussion');
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'discussion.delete',
                    { id, userId: requester?.sub }
                )
            );
            return successResponse(result, 'Discussion deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete discussion');
        }
    }
}
