import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards, Req } from '@nestjs/common';
import type {
    PostCreateDTO,
    PostUpdateDTO,
    PostQueryDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard, Public, successResponse, successPaginatedResponse } from '@server/shared';
import { PostService } from '../../modules/post/post.service';

/**
 * Post HTTP Controller
 * Handles post operations
 */
@Controller('posts')
@UseGuards(GatewayAuthGuard)
export class PostController {
    private readonly logger = new Logger(PostController.name);

    constructor(private readonly postService: PostService) { }

    /**
     * Get all posts with pagination
     */
    @Public()
    @Get()
    async findAllPosts(@Query() query: PostQueryDTO) {
        const result = await this.postService.findAllPosts(query);
        return successPaginatedResponse(
            result.data,
            result.total,
            result.page,
            result.limit,
            result.totalPages,
        );
    }

    /**
     * Get post by slug
     */
    @Public()
    @Get('slug/:slug')
    async findPostBySlug(@Param('slug') slug: string) {
        const post = await this.postService.findPostBySlug(slug);
        return successResponse(post);
    }

    /**
     * Get post by ID
     */
    @Public()
    @Get(':id')
    async findPostById(@Param('id') id: string) {
        const post = await this.postService.findPostById(id);
        return successResponse(post);
    }

    /**
     * Increment view count for a post
     */
    @Public()
    @Patch(':id/view')
    async incrementViewCount(@Param('id') id: string) {
        await this.postService.incrementViewCount(id);
        return successResponse(null, 'View count incremented');
    }

    /**
     * Create new post
     */
    @Post()
    async createPost(@Body() dto: PostCreateDTO, @Req() req: any) {
        const post = await this.postService.createPost(dto);
        return successResponse(post, 'Post created successfully');
    }

    /**
     * Update post
     */
    @Patch(':id')
    async updatePost(@Param('id') id: string, @Body() dto: PostUpdateDTO) {
        const post = await this.postService.updatePost(id, dto);
        return successResponse(post, 'Post updated successfully');
    }

    /**
     * Delete post
     */
    @Delete(':id')
    async deletePost(@Param('id') id: string) {
        await this.postService.deletePost(id);
        return successResponse(null, 'Post deleted successfully');
    }
}