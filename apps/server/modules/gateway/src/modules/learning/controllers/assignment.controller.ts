import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Inject,
    HttpCode,
    HttpStatus,
    Req,
    ParseUUIDPipe,
    UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    successResponse,
    successPaginatedResponse,
    ZodValidationPipe,
    ReqWithRequester,
} from '@server/shared';
import {
    createAssignmentDto,
    updateAssignmentDto,
    queryAssignmentsDto
} from '@workspace/schemas';
import type { QueryAssignmentsDto } from '@workspace/schemas';

@Controller('api/assignments')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AssignmentController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @Permissions('assignment.create')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(createAssignmentDto))
    async create(@Body() dto: any, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.create' },
                { ...dto, requester: req.requester }
            )
        );
        return successResponse({ assignment: result }, 'Assignment created successfully');
    }

    @Post('search')
    async findAll(@Body(new ZodValidationPipe(queryAssignmentsDto)) query: QueryAssignmentsDto, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.findAll' },
                { ...query, requester: req.requester }
            )
        );
        return successPaginatedResponse(result);
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.assignment.findOne' }, { id })
        );
        return successResponse({ assignment: result });
    }

    @Get(':id/submissions')
    @Permissions('assignment.grade')
    async getSubmissions(@Param('id', new ParseUUIDPipe()) id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.submission.findAll' }, { assignmentId: id })
        );
        return successResponse({ submissions: result });
    }

    @Put(':id')
    @Permissions('assignment.update')
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new ZodValidationPipe(updateAssignmentDto)) dto: any,
        @Req() req: ReqWithRequester
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.update' },
                { id, ...dto, requester: req.requester }
            )
        );
        return successResponse({ assignment: result }, 'Assignment updated successfully');
    }

    @Patch(':id/publish')
    @Permissions('assignment.publish')
    async publish(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.publish' },
                { id, requester: req.requester }
            )
        );
        return successResponse({ assignment: result }, 'Assignment published successfully');
    }

    @Delete(':id')
    @Permissions('assignment.delete')
    async delete(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
        await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.delete' },
                { id, requester: req.requester }
            )
        );
        return successResponse(null, 'Assignment deleted successfully');
    }
}
