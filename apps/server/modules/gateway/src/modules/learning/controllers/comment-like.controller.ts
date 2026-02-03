import {
    Controller,
    Post,
    Delete,
    Get,
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
    Public
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';
import { Request } from 'express';

@Controller('api/comments')
@UseGuards(GatewayAuthGuard)
export class CommentLikeController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post(':id/like')
    async likeComment(@Param('id') commentId: string, @Req() req: Request) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return errorResponse('User not authenticated');
            }

            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.like' },
                    { commentId, userId }
                )
            );
            return successResponse({ like: result }, 'Comment liked successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to like comment');
        }
    }

    @Delete(':id/like')
    async unlikeComment(@Param('id') commentId: string, @Req() req: Request) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return errorResponse('User not authenticated');
            }

            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.unlike' },
                    { commentId, userId }
                )
            );
            return successResponse(null, 'Comment unliked successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to unlike comment');
        }
    }

    @Public()
    @Get(':id/likes')
    async getCommentLikes(@Param('id') commentId: string, @Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.getLikes' },
                    { commentId, page: query.page, limit: query.limit }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch comment likes');
        }
    }

    @Public()
    @Get(':id/like-count')
    async getCommentLikeCount(@Param('id') commentId: string) {
        try {
            const count = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.getLikeCount' },
                    { commentId }
                )
            );
            return successResponse({ count }, 'Like count fetched successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch like count');
        }
    }
}
