import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards, Req } from '@nestjs/common';
import type {
    PostCreateDTO,
    PostUpdateDTO,
    PostQueryDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard, Public } from '@server/shared';
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
    findAllPosts(@Query() query: PostQueryDTO) {
        return this.postService.findAllPosts(query);
    }

    /**
     * Get post by ID
     */
    @Public()
    @Get(':id')
    findPostById(@Param('id') id: string) {
        return this.postService.findPostById(id);
    }

    /**
     * Create new post
     */
    @Post()
    createPost(@Body() dto: PostCreateDTO, @Req() req: any) {
        return this.postService.createPost(dto);
    }

    /**
     * Update post
     */
    @Patch(':id')
    updatePost(@Param('id') id: string, @Body() dto: PostUpdateDTO) {
        return this.postService.updatePost(id, dto);
    }

    /**
     * Delete post
     */
    @Delete(':id')
    deletePost(@Param('id') id: string) {
        return this.postService.deletePost(id);
    }
}
