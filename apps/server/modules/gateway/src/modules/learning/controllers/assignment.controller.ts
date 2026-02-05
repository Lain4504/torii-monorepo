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
} from '@server/shared';
import { Request } from 'express';
import { 
    Requester, 
    createAssignmentDto, 
    updateAssignmentDto, 
    queryAssignmentsDto 
} from '@workspace/schemas';

interface RequestWithUser extends Request {
    user: Requester & { email: string };
}

@Controller('api/assignments')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AssignmentController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @Permissions('assignment.create')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(createAssignmentDto))
    async create(@Body() dto: any, @Req() req: RequestWithUser) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.create' },
                { ...dto, requester: req.user }
            )
        );
        return successResponse(result, 'Assignment created successfully');
    }

    @Get()
    async findAll(@Query(new ZodValidationPipe(queryAssignmentsDto)) query: any, @Req() req: RequestWithUser) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.findAll' },
                { ...query, requester: req.user }
            )
        );
        return successPaginatedResponse(result);
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.assignment.findOne' }, { id })
        );
        return successResponse(result);
    }

    @Put(':id')
    @Permissions('assignment.update')
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new ZodValidationPipe(updateAssignmentDto)) dto: any,
        @Req() req: RequestWithUser
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.update' },
                { id, ...dto, requester: req.user }
            )
        );
        return successResponse(result, 'Assignment updated successfully');
    }

    @Patch(':id/publish')
    @Permissions('assignment.publish')
    async publish(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: RequestWithUser) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.publish' },
                { id, requester: req.user }
            )
        );
        return successResponse(result, 'Assignment published successfully');
    }

    @Delete(':id')
    @Permissions('assignment.delete')
    async delete(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: RequestWithUser) {
        await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.assignment.delete' },
                { id, requester: req.user }
            )
        );
        return successResponse(null, 'Assignment deleted successfully');
    }
}
