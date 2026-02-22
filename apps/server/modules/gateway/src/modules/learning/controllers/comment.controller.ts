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
    Public,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/comments')
@UseGuards(GatewayAuthGuard)
export class CommentController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Public()
    @Post('search')
    async findAllComments(@Body() query: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const userId = requester?.sub;

            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.findAll' },
                    { ...query, userId }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch comments');
        }
    }

    @Public()
    @Get(':id')
    async findCommentById(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.findById' },
                    { id }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch comment');
        }
    }

    @Public()
    @Get(':id/replies')
    async getCommentWithReplies(@Param('id') id: string, @Query('depth') depth?: number) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.getWithReplies' },
                    { id, depth }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch comment replies');
        }
    }

    @Post()
    async createComment(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.create' },
                    { ...dto, userId: requester?.sub }
                )
            );
            return successResponse(result, 'Comment created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create comment');
        }
    }

    @Patch(':id')
    async updateComment(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.update' },
                    { id, dto, userId: requester?.sub }
                )
            );
            return successResponse(result, 'Comment updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update comment');
        }
    }

    @Delete(':id')
    async deleteComment(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.delete' },
                    { id, userId: requester?.sub }
                )
            );
            return successResponse(null, 'Comment deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete comment');
        }
    }

    @Post(':id/like')
    async toggleLike(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.toggleLike' },
                    { id, userId: requester?.sub }
                )
            );
            return successResponse(result, 'Like toggled successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to toggle like');
        }
    }
}
