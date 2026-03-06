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
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/notes')
@UseGuards(GatewayAuthGuard)
export class NoteController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post()
    async createNote(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.note.create' },
                    { userId: req.requester.sub, dto },
                ),
            );
            return successResponse(result, 'Note created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create note');
        }
    }

    @Get()
    async getNotes(@Query() query: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.note.findAll' },
                    { userId: req.requester.sub, ...query },
                ),
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch notes');
        }
    }

    @Patch(':id')
    async updateNote(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.note.update' },
                    { userId: req.requester.sub, id, dto },
                ),
            );
            return successResponse(result, 'Note updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update note');
        }
    }

    @Delete(':id')
    async deleteNote(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.note.delete' },
                    { userId: req.requester.sub, id },
                ),
            );
            return successResponse(null, 'Note deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete note');
        }
    }

    @Post(':id/to-flashcard')
    async convertToFlashcard(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.note.toFlashcard' },
                    { userId: req.requester.sub, id, dto },
                ),
            );
            return successResponse(result, 'Converted to flashcard successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to convert note to flashcard');
        }
    }
}
