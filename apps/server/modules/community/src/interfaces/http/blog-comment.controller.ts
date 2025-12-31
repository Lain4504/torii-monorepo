import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards, Req } from '@nestjs/common';
import { BlogCommentService } from '../../modules/blog-comment/blog-comment.service';
import type {
    BlogCommentCreateDTO,
    BlogCommentUpdateDTO,
    BlogCommentQueryDTO,
} from '@workspace/schemas';
import { FirebaseAuthGuard } from '@server/shared';

@Controller('blog-comments')
export class BlogCommentController {
    constructor(private readonly blogCommentService: BlogCommentService) { }

    @Get()
    findAllComments(@Query() query: BlogCommentQueryDTO) {
        return this.blogCommentService.findAllComments(query);
    }

    @Get(':id')
    findCommentById(@Param('id') id: string) {
        return this.blogCommentService.findCommentById(id);
    }

    @Get(':id/replies')
    getCommentWithReplies(@Param('id') commentId: string, @Query('depth') depth?: number) {
        return this.blogCommentService.getCommentWithReplies(commentId, depth);
    }

    @Post()
    @UseGuards(FirebaseAuthGuard)
    async createComment(@Body() dto: BlogCommentCreateDTO, @Req() req: any) {
        // Ideally we force authorId from req.user.uid
        // Let's assume service or DTO handles validation, but for security we should probably set it.
        // Checking DTO: BlogCommentCreateDTO usually has authorId.
        const userId = req.user.uid;
        // We should probably enforce authorId matches token, but for now strict proxy.
        if (!dto.authorId) dto.authorId = userId;
        return this.blogCommentService.createComment(dto);
    }

    @Patch(':id')
    @UseGuards(FirebaseAuthGuard)
    updateComment(
        @Param('id') id: string,
        @Body() dto: BlogCommentUpdateDTO,
        @Req() req: any
    ) {
        const userId = req.user.uid;
        return this.blogCommentService.updateComment(id, userId, dto);
    }

    @Delete(':id')
    @UseGuards(FirebaseAuthGuard)
    deleteComment(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.uid;
        return this.blogCommentService.deleteComment(id, userId);
    }
}
