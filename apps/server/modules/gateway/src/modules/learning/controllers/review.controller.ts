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
    errorResponse
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
            return result; // Usually paginated response is returned directly or standardized
            // Original controller returns PaginatedReviewResponseDTO directly.
            // Let's assume standardization if needed, or return raw result if it matches DTO.
            // If result is already structured, just return it.
            // But usually we wrap in successResponse? 
            // The original controller returned the DTO directly.
            // Let's wrap it in successResponse anyway for consistency in Gateway, 
            // UNLESS FE expects raw pagination object.
            // Let's assume standard response structure.
            // Wait, previous conversions used successPaginatedResponse.
            // ReviewService.findByCourseId returns PaginatedReviewResponseDTO.
            // Let's check DTO structure. If it has data, page, limit etc.
            // I'll return successResponse(result) or successPaginatedResponse if I can map it.
            // ReviewService outcome is a proprietary object.
            // Let's return successResponse(result).
            return successResponse(result);
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
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create review');
        }
    }
}
