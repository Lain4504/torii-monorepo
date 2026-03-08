import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Inject,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    GatewayAuthGuard,
    ReqWithRequester,
    ZodValidationPipe,
    successResponse,
    errorResponse,
} from '@server/shared';
import { firstValueFrom } from 'rxjs';
import {
    CreateStudyNoteDto,
    UpdateStudyNoteDto,
    createStudyNoteSchema,
    updateStudyNoteSchema,
} from '../../../../../academy/src/modules/study-note/study-note.dto';

@Controller('api/academy/study-notes')
@UseGuards(GatewayAuthGuard)
export class StudyNoteController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    async create(
        @Req() req: ReqWithRequester,
        @Body(new ZodValidationPipe(createStudyNoteSchema)) createDto: CreateStudyNoteDto,
    ) {
        try {
            const item = await firstValueFrom(
                this.natsClient.send('academy.study-note.create', {
                    userId: req.requester.sub,
                    data: createDto,
                }),
            );
            return successResponse({ item });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Get()
    async findAll(
        @Req() req: ReqWithRequester,
        @Query('lessonId') lessonId?: string,
    ) {
        try {
            const items = await firstValueFrom(
                this.natsClient.send('academy.study-note.findAll', {
                    userId: req.requester.sub,
                    lessonId,
                }),
            );
            return successResponse({ items });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @Req() req: ReqWithRequester,
    ) {
        try {
            const item = await firstValueFrom(
                this.natsClient.send('academy.study-note.findOne', { id, userId: req.requester.sub }),
            );
            return successResponse({ item });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Req() req: ReqWithRequester,
        @Body(new ZodValidationPipe(updateStudyNoteSchema)) updateDto: UpdateStudyNoteDto,
    ) {
        try {
            const item = await firstValueFrom(
                this.natsClient.send('academy.study-note.update', {
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

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @Req() req: ReqWithRequester,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send('academy.study-note.remove', { id, userId: req.requester.sub }),
            );
            return successResponse({ result });
        } catch (error: any) {
            return errorResponse(error.message);
        }
    }
}
