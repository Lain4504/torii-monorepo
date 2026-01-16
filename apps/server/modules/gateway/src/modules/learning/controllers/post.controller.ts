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
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('api/posts')
@UseGuards(IdentityAuthGuard)
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
    async incrementViewCount(@Param('id') id: string) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.incrementView' },
                    { id }
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
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.post.create' },
                    dto
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
}
