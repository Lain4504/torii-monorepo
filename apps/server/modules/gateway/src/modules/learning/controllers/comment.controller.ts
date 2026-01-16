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

@Controller('comments')
@UseGuards(IdentityAuthGuard)
export class CommentController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Public()
    @Get()
    async findAllComments(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.findAll' },
                    query
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
    async createComment(@Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.create' },
                    { ...dto, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(result, 'Comment created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create comment');
        }
    }

    @Patch(':id')
    async updateComment(@Param('id') id: string, @Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.update' },
                    { id, dto, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(result, 'Comment updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update comment');
        }
    }

    @Delete(':id')
    async deleteComment(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.comment.delete' },
                    { id, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(null, 'Comment deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete comment');
        }
    }
}
