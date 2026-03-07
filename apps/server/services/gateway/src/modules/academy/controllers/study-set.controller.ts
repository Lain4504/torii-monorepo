import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Inject,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    GatewayAuthGuard,
    Permissions,
    PermissionsGuard,
    ReqWithRequester,
    ZodValidationPipe,
    successResponse,
    errorResponse,
} from '@server/shared';
import { firstValueFrom } from 'rxjs';
import {
    CreateStudySetDto,
    UpdateStudySetDto,
    CreateSetCardDto,
    UpdateSetCardDto,
    ReviewSetCardDto,
    createStudySetSchema,
    updateStudySetSchema,
    createSetCardSchema,
    updateSetCardSchema,
    reviewSetCardSchema,
} from '../../../../../academy/src/modules/study-set/study-set.dto';

@Controller('api/academy')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class StudySetController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    // --- Study Set Endpoints ---

    @Post('study-sets')
    @Permissions('academy.content.write')
    async createSet(
        @Req() req: ReqWithRequester,
        @Body(new ZodValidationPipe(createStudySetSchema)) createDto: CreateStudySetDto,
    ) {
        try {
            const item = await firstValueFrom(
                this.natsClient.send('academy.study-set.createSet', {
                    userId: req.requester.sub,
                    data: createDto,
                }),
            );
            return successResponse({ item });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Get('study-sets')
    @Permissions('academy.content.read', 'academy.content.write')
    async findAllSets(@Req() req: ReqWithRequester) {
        try {
            const items = await firstValueFrom(
                this.natsClient.send('academy.study-set.findAllSets', {
                    userId: req.requester.sub,
                }),
            );
            return successResponse({ items });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Get('study-sets/:id')
    @Permissions('academy.content.read', 'academy.content.write')
    async findSetById(
        @Param('id') id: string,
        @Req() req: ReqWithRequester,
    ) {
        try {
            const item = await firstValueFrom(
                this.natsClient.send('academy.study-set.findSetById', {
                    id,
                    userId: req.requester.sub,
                }),
            );
            return successResponse({ item });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Patch('study-sets/:id')
    @Permissions('academy.content.write')
    async updateSet(
        @Param('id') id: string,
        @Req() req: ReqWithRequester,
        @Body(new ZodValidationPipe(updateStudySetSchema)) updateDto: UpdateStudySetDto,
    ) {
        try {
            const item = await firstValueFrom(
                this.natsClient.send('academy.study-set.updateSet', {
                    id,
                    userId: req.requester.sub,
                    data: updateDto,
                }),
            );
            return successResponse({ item });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Delete('study-sets/:id')
    @Permissions('academy.content.write')
    async deleteSet(
        @Param('id') id: string,
        @Req() req: ReqWithRequester,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send('academy.study-set.deleteSet', {
                    id,
                    userId: req.requester.sub,
                }),
            );
            return successResponse({ result });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    // --- Set Card Endpoints ---

    @Post('study-sets/:id/cards')
    @Permissions('academy.content.write')
    async createCard(
        @Param('id') setId: string,
        @Req() req: ReqWithRequester,
        @Body(new ZodValidationPipe(createSetCardSchema)) createDto: CreateSetCardDto,
    ) {
        try {
            const item = await firstValueFrom(
                this.natsClient.send('academy.study-set.createCard', {
                    setId,
                    userId: req.requester.sub,
                    data: createDto,
                }),
            );
            return successResponse({ item });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Patch('set-cards/:id')
    @Permissions('academy.content.write')
    async updateCard(
        @Param('id') cardId: string,
        @Req() req: ReqWithRequester,
        @Body(new ZodValidationPipe(updateSetCardSchema)) updateDto: UpdateSetCardDto,
    ) {
        try {
            const item = await firstValueFrom(
                this.natsClient.send('academy.study-set.updateCard', {
                    cardId,
                    userId: req.requester.sub,
                    data: updateDto,
                }),
            );
            return successResponse({ item });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Delete('set-cards/:id')
    @Permissions('academy.content.write')
    async deleteCard(
        @Param('id') cardId: string,
        @Req() req: ReqWithRequester,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send('academy.study-set.deleteCard', {
                    cardId,
                    userId: req.requester.sub,
                }),
            );
            return successResponse({ result });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    // --- Study Flow / SRS Endpoints ---

    @Get('study-sets/:id/study')
    @Permissions('academy.content.read')
    async getStudyCards(
        @Param('id') setId: string,
        @Req() req: ReqWithRequester,
    ) {
        try {
            const items = await firstValueFrom(
                this.natsClient.send('academy.study-set.getStudyCards', {
                    setId,
                    userId: req.requester.sub,
                }),
            );
            return successResponse({ items });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Post('set-cards/:id/review')
    @Permissions('academy.content.write')
    async reviewCard(
        @Param('id') cardId: string,
        @Req() req: ReqWithRequester,
        @Body(new ZodValidationPipe(reviewSetCardSchema)) reviewDto: ReviewSetCardDto,
    ) {
        try {
            const item = await firstValueFrom(
                this.natsClient.send('academy.study-set.reviewCard', {
                    cardId,
                    userId: req.requester.sub,
                    data: reviewDto,
                }),
            );
            return successResponse({ item });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    // --- Extra Study Modes Endpoints ---

    @Get('study-sets/:id/study-modes/test')
    @Permissions('academy.content.read')
    async getTestQuiz(
        @Param('id') setId: string,
        @Req() req: ReqWithRequester,
        @Req() request: any, // To extract query params easily if we don't import Query
    ) {
        try {
            const count = request.query.count ? parseInt(request.query.count, 10) : 20;
            const types = request.query.types || 'multiple_choice,true_false';

            const items = await firstValueFrom(
                this.natsClient.send('academy.study-set.getTestQuiz', {
                    setId,
                    userId: req.requester.sub,
                    count,
                    types,
                }),
            );
            return successResponse({ items });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Get('study-sets/:id/study-modes/match')
    @Permissions('academy.content.read')
    async getMatchGame(
        @Param('id') setId: string,
        @Req() req: ReqWithRequester,
        @Req() request: any,
    ) {
        try {
            const count = request.query.count ? parseInt(request.query.count, 10) : 6;

            const items = await firstValueFrom(
                this.natsClient.send('academy.study-set.getMatchGame', {
                    setId,
                    userId: req.requester.sub,
                    count,
                }),
            );
            return successResponse({ items });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }
}
