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
    successPaginatedResponse,
    Public,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/course-masters')
export class CourseMasterReviewController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Delete('reviews/:id')
    @UseGuards(GatewayAuthGuard)
    async deleteReview(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.delete' },
                    { id, userId: requester.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete review');
        }
    }

    @Get('reviews/:id')
    @UseGuards(GatewayAuthGuard)
    async getReviewById(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.findById' },
                    { id }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch review');
        }
    }

    @Get(':courseMasterId/reviews')
    @Public()
    async getReviewsByCourse(@Param('courseMasterId') courseMasterId: string, @Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.findByCourseId' },
                    { courseMasterId, query }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch reviews');
        }
    }

    @Post('reviews/search')
    @Public()
    async getAllReviews(@Body() body: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.findAll' },
                    { query: body } // Pass the body as query if it matches the expected structure
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch all reviews');
        }
    }

    @Get(':courseMasterId/reviews/distribution')
    @Public()
    async getRatingDistribution(@Param('courseMasterId') courseMasterId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.getRatingDistribution' },
                    { courseMasterId }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch rating distribution');
        }
    }

    @Post(':courseMasterId/reviews')
    @UseGuards(GatewayAuthGuard)
    async createReview(@Param('courseMasterId') courseMasterId: string, @Body() input: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            // The client should send courseRunId in the input body now
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.review.create' },
                    { ...input, userId: requester.sub }
                )
            );
            return successResponse({ review: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create review');
        }
    }
}
