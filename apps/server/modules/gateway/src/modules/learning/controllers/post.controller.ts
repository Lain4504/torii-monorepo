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
    Public
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';
import { Request } from 'express';

@Controller('api/posts')
@UseGuards(GatewayAuthGuard)
export class PostController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Public()
    @Get()
    async findAllPosts(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch posts');
        }
    }

    @Public()
    @Get('slug/:slug')
    async findPostBySlug(@Param('slug') slug: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.findBySlug' },
                    { slug }
                )
            );
            return successResponse({ post: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch post');
        }
    }

    @Public()
    @Get(':id')
    async findPostById(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.findById' },
                    { id }
                )
            );
            return successResponse({ post: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch post');
        }
    }

    @Public()
    @Patch(':id/view')
    async incrementViewCount(@Param('id') id: string, @Req() req: Request) {
        try {
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.incrementView' },
                    { id, ip }
                )
            );
            return successResponse(null, 'View count incremented');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to increment view count');
        }
    }

    @Post()
    async createPost(@Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.create' },
                    { ...dto, authorId: user?.sub || user?.uid }
                )
            );
            return successResponse({ post: result }, 'Post created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create post');
        }
    }

    @Patch(':id')
    async updatePost(@Param('id') id: string, @Body() dto: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.update' },
                    { id, dto }
                )
            );
            return successResponse({ post: result }, 'Post updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update post');
        }
    }

    @Delete(':id')
    async deletePost(@Param('id') id: string) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.delete' },
                    { id }
                )
            );
            return successResponse(null, 'Post deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete post');
        }
    }

    @Patch(':id/publish')
    async publishPost(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.publish' },
                    { id }
                )
            );
            return successResponse({ post: result }, 'Post published successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to publish post');
        }
    }

    @Post(':id/like')
    async likePost(@Param('id') postId: string, @Req() req: Request) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return errorResponse('User not authenticated');
            }

            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.like' },
                    { postId, userId }
                )
            );
            return successResponse({ like: result }, 'Post liked successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to like post');
        }
    }

    @Delete(':id/like')
    async unlikePost(@Param('id') postId: string, @Req() req: Request) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return errorResponse('User not authenticated');
            }

            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.unlike' },
                    { postId, userId }
                )
            );
            return successResponse(null, 'Post unliked successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to unlike post');
        }
    }

    @Public()
    @Get(':id/likes')
    async getPostLikes(@Param('id') postId: string, @Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.getLikes' },
                    { postId, page: query.page, limit: query.limit }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch post likes');
        }
    }

    @Public()
    @Get(':id/like-count')
    async getPostLikeCount(@Param('id') postId: string) {
        try {
            const count = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.getLikeCount' },
                    { postId }
                )
            );
            return successResponse({ count }, 'Like count fetched successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch like count');
        }
    }


}
