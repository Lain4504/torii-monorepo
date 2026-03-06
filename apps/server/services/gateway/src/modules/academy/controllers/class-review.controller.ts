import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    Permissions,
    PermissionsGuard,
    ZodValidationPipe,
    successResponse,
    ReqWithRequester,
} from '@server/shared';
import {
    academyClassReviewCreateDTOSchema,
    academyClassReviewUpdateDTOSchema,
    academyClassReviewQueryDTOSchema,
    academyClassReviewAdminQueryDTOSchema,
    academyClassReviewModerateDTOSchema,
} from '@workspace/schemas';

@Controller()
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ClassReviewController {
    constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

    // ── Public routes ──────────────────────────────────────────────────────────

    /**
     * GET /api/academy/classes/:classId/reviews
     * Public: list PUBLISHED reviews for a class.
     */
    @Get('api/academy/classes/:classId/reviews')
    async listByClass(
        @Param('classId', new ParseUUIDPipe()) classId: string,
        @Query(new ZodValidationPipe(academyClassReviewQueryDTOSchema)) query: any,
    ) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.classReview.listByClass' }, { classId, query }),
        );
        return successResponse(result);
    }

    /**
     * GET /api/academy/me/class-reviews
     * Authenticated: return current user's reviews.
     */
    @Get('api/academy/me/class-reviews')
    async listMine(@Req() req: ReqWithRequester) {
        const userId = req.requester.sub;
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.classReview.listMine' }, { userId }),
        );
        return successResponse(result);
    }

    // ── Learner write routes ───────────────────────────────────────────────────

    /**
     * POST /api/academy/classes/:classId/reviews
     * Authenticated: create a review for a class.
     */
    @Post('api/academy/classes/:classId/reviews')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Param('classId', new ParseUUIDPipe()) classId: string,
        @Body(new ZodValidationPipe(academyClassReviewCreateDTOSchema)) dto: any,
        @Req() req: ReqWithRequester,
    ) {
        const userId = req.requester.sub;
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.classReview.create' }, { classId, userId, dto }),
        );
        return successResponse(result);
    }

    /**
     * PATCH /api/academy/class-reviews/:id
     * Authenticated: update own review.
     */
    @Patch('api/academy/class-reviews/:id')
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new ZodValidationPipe(academyClassReviewUpdateDTOSchema)) dto: any,
        @Req() req: ReqWithRequester,
    ) {
        const userId = req.requester.sub;
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.classReview.update' }, { id, userId, dto }),
        );
        return successResponse(result);
    }

    /**
     * DELETE /api/academy/class-reviews/:id
     * Authenticated: soft-delete (hide) own review.
     */
    @Delete('api/academy/class-reviews/:id')
    async hide(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Req() req: ReqWithRequester,
    ) {
        const userId = req.requester.sub;
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.classReview.hide' }, { id, userId }),
        );
        return successResponse(result);
    }

    // ── Admin routes ───────────────────────────────────────────────────────────

    /**
     * GET /api/academy/admin/class-reviews
     * Admin: list all reviews with advanced filters.
     */
    @Get('api/academy/admin/class-reviews')
    @Permissions('academy.delivery.admin')
    async adminList(
        @Query(new ZodValidationPipe(academyClassReviewAdminQueryDTOSchema)) query: any,
    ) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.classReview.adminList' }, query),
        );
        return successResponse(result);
    }

    /**
     * POST /api/academy/admin/class-reviews/:id/moderate
     * Admin: publish / hide / reject a review.
     */
    @Post('api/academy/admin/class-reviews/:id/moderate')
    @Permissions('academy.delivery.admin')
    @HttpCode(HttpStatus.OK)
    async moderate(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new ZodValidationPipe(academyClassReviewModerateDTOSchema)) dto: any,
        @Req() req: ReqWithRequester,
    ) {
        const moderatorId = req.requester.sub;
        const result = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.classReview.moderate' },
                { id, moderatorId, dto },
            ),
        );
        return successResponse(result);
    }
}
