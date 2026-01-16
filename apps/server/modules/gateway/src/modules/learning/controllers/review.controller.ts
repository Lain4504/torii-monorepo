import {
    Controller,
    Get,
    Post,
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
    successPaginatedResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('courses')
export class ReviewController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Delete('reviews/:id')
    @UseGuards(IdentityAuthGuard)
    async deleteReview(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.delete' },
                    { id, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete review');
        }
    }

    @Get(':courseId/reviews')
    async getReviewsByCourse(@Param('courseId') courseId: string, @Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.findByCourseId' },
                    { courseId, query }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch reviews');
        }
    }

    @Get(':courseId/reviews/distribution')
    async getRatingDistribution(@Param('courseId') courseId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.getRatingDistribution' },
                    { courseId }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch rating distribution');
        }
    }

    @Post(':courseId/reviews')
    @UseGuards(IdentityAuthGuard)
    async createReview(@Param('courseId') courseId: string, @Body() input: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.create' },
                    { ...input, courseId, userId: user.sub }
                )
            );
            return successResponse({ review: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create review');
        }
    }
}
