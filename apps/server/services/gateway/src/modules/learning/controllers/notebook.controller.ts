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
    HttpException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/notebooks')
@UseGuards(GatewayAuthGuard)
export class NotebookController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    // ── Notebook endpoints ─────────────────────────────────────────

    @Post()
    async createNotebook(@Body() input: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.create' },
                    { ...input, userId: req.requester.sub },
                ),
            );
            return successResponse({ notebook: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to create notebook', error.status || 400);
        }
    }

    @Get()
    async findAllNotebooks(@Query() query: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.findAll' },
                    { userId: req.requester.sub, search: query.search },
                ),
            );
            return successResponse({ notebooks: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch notebooks', error.status || 400);
        }
    }

    @Get('public')
    async findPublicNotebooks(@Query() query: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.findPublic' },
                    { search: query.search, excludeUserId: req.requester.sub },
                ),
            );
            return successResponse({ notebooks: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch public notebooks', error.status || 400);
        }
    }

    @Get(':id')
    async findOneNotebook(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.findById' },
                    { id, userId: req.requester.sub },
                ),
            );
            return successResponse({ notebook: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch notebook', error.status || 400);
        }
    }

    @Patch(':id')
    async updateNotebook(@Param('id') id: string, @Body() input: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.update' },
                    { id, input, userId: req.requester.sub },
                ),
            );
            return successResponse({ notebook: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to update notebook', error.status || 400);
        }
    }

    @Delete(':id')
    async deleteNotebook(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.delete' },
                    { id, userId: req.requester.sub },
                ),
            );
            return successResponse(null, 'Notebook deleted successfully');
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to delete notebook', error.status || 400);
        }
    }

    // ── NoteEntry endpoints ─────────────────────────────────────────

    @Post(':id/entries')
    async addEntry(@Param('id') notebookId: string, @Body() input: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.entry.add' },
                    { notebookId, entry: input, userId: req.requester.sub },
                ),
            );
            return successResponse({ entry: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to add entry', error.status || 400);
        }
    }

    @Patch(':id/entries/:entryId')
    async updateEntry(
        @Param('id') notebookId: string,
        @Param('entryId') entryId: string,
        @Body() input: any,
        @Req() req: ReqWithRequester,
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.entry.update' },
                    { notebookId, entryId, entry: input, userId: req.requester.sub },
                ),
            );
            return successResponse({ entry: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to update entry', error.status || 400);
        }
    }

    @Delete(':id/entries/:entryId')
    async deleteEntry(
        @Param('id') notebookId: string,
        @Param('entryId') entryId: string,
        @Req() req: ReqWithRequester,
    ) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.entry.delete' },
                    { notebookId, entryId, userId: req.requester.sub },
                ),
            );
            return successResponse(null, 'Entry deleted successfully');
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to delete entry', error.status || 400);
        }
    }

    @Post(':id/entries/bulk')
    async bulkCreateEntries(@Param('id') notebookId: string, @Body() input: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.notebook.entry.bulkCreate' },
                    { notebookId, entries: input.entries, userId: req.requester.sub },
                ),
            );
            return successResponse(result);
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to bulk create entries', error.status || 400);
        }
    }
}
