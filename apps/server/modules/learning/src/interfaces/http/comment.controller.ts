import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards, Req } from '@nestjs/common';
import type {
    CommentCreateDTO,
    CommentUpdateDTO,
    CommentQueryDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard, Public } from '@server/shared';
import { CommentService } from '../../modules/comment/comment.service';

/**
 * Comment HTTP Controller
 * Handles comment operations
 */
@Controller('comments')
@UseGuards(GatewayAuthGuard)
export class CommentController {
    private readonly logger = new Logger(CommentController.name);

    constructor(private readonly commentService: CommentService) { }

    /**
     * Get all comments with pagination
     */
    @Public()
    @Get()
    findAllComments(@Query() query: CommentQueryDTO) {
        return this.commentService.findAllComments(query);
    }

    /**
     * Get comment by ID
     */
    @Public()
    @Get(':id')
    findCommentById(@Param('id') id: string) {
        return this.commentService.findCommentById(id);
    }

    /**
     * Get comment with nested replies
     */
    @Public()
    @Get(':id/replies')
    getCommentWithReplies(@Param('id') commentId: string, @Query('depth') depth?: number) {
        return this.commentService.getCommentWithReplies(commentId, depth);
    }

    /**
     * Create new comment
     */
    @Post()
    async createComment(@Body() dto: CommentCreateDTO, @Req() req: any) {
        const userId = req.user.uid;
        if (!dto.authorId) dto.authorId = userId;
        return this.commentService.createComment(dto);
    }

    /**
     * Update comment
     */
    @Patch(':id')
    updateComment(
        @Param('id') id: string,
        @Body() dto: CommentUpdateDTO,
        @Req() req: any
    ) {
        const userId = req.user.uid;
        return this.commentService.updateComment(id, userId, dto);
    }

    /**
     * Delete comment
     */
    @Delete(':id')
    deleteComment(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.uid;
        return this.commentService.deleteComment(id, userId);
    }
}
