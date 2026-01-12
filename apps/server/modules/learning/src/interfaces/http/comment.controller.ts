import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards, Req } from '@nestjs/common';
import type {
    CommentCreateDTO,
    CommentUpdateDTO,
    CommentQueryDTO,
    CommentResponseDTO,
    CommentPaginatedResponse,
} from '@workspace/schemas';
import { GatewayAuthGuard, Public, successResponse, successPaginatedResponse } from '@server/shared';
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
    async findAllComments(@Query() query: CommentQueryDTO) {
        const result = await this.commentService.findAllComments(query);
        return successPaginatedResponse(
            result.data,
            result.total,
            result.page,
            result.limit,
            result.totalPages,
        );
    }

    /**
     * Get comment by ID
     */
    @Public()
    @Get(':id')
    async findCommentById(@Param('id') id: string) {
        const comment = await this.commentService.findCommentById(id);
        return successResponse(comment);
    }

    /**
     * Get comment with nested replies
     */
    @Public()
    @Get(':id/replies')
    async getCommentWithReplies(@Param('id') commentId: string, @Query('depth') depth?: number) {
        const comment = await this.commentService.getCommentWithReplies(commentId, depth);
        return successResponse(comment);
    }

    /**
     * Create new comment
     */
    @Post()
    async createComment(@Body() dto: CommentCreateDTO, @Req() req: any) {
        const userId = req.user?.uid;

        // Map userId from DTO to authorId if present (Fix for Schema mismatch)
        if ((dto as any).userId && !dto.authorId) {
            dto.authorId = (dto as any).userId;
        }

        if (!dto.authorId && userId) dto.authorId = userId;

        const comment = await this.commentService.createComment(dto);
        return successResponse(comment, 'Comment created successfully');
    }

    /**
     * Update comment
     */
    @Patch(':id')
    async updateComment(
        @Param('id') id: string,
        @Body() dto: CommentUpdateDTO,
        @Req() req: any
    ) {
        const userId = req.user.uid;
        const comment = await this.commentService.updateComment(id, userId, dto);
        return successResponse(comment, 'Comment updated successfully');
    }

    /**
     * Delete comment
     */
    @Delete(':id')
    async deleteComment(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.uid;
        await this.commentService.deleteComment(id, userId);
        return successResponse(null, 'Comment deleted successfully');
    }
}
