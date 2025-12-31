import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards, Req } from '@nestjs/common';
import { BlogService } from '../../modules/blog/blog.service';
import type {
    BlogPostCreateDTO,
    BlogPostUpdateDTO,
    BlogPostQueryDTO,
} from '@workspace/schemas';
import { UserRole } from '@workspace/schemas';
import { FirebaseAuthGuard, RolesGuard, Roles } from '@server/shared';

@Controller('blogs')
export class BlogController {
    private readonly logger = new Logger(BlogController.name);

    constructor(private readonly blogService: BlogService) { }

    @Get()
    findAllPosts(@Query() query: BlogPostQueryDTO) {
        return this.blogService.findAllPosts(query);
    }

    @Get(':id')
    findPostById(@Param('id') id: string) {
        return this.blogService.findPostById(id);
    }

    @Post()
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    createPost(@Body() dto: BlogPostCreateDTO, @Req() req: any) {
        // Override authorId from token if needed, usually DTO has it or service handles it.
        // Assuming DTO matches schema.
        return this.blogService.createPost(dto);
    }

    @Patch(':id')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    updatePost(@Param('id') id: string, @Body() dto: BlogPostUpdateDTO) {
        return this.blogService.updatePost(id, dto);
    }

    @Delete(':id')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    deletePost(@Param('id') id: string) {
        return this.blogService.deletePost(id);
    }
}
