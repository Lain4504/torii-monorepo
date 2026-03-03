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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    successResponse,
    successPaginatedResponse,
    Public,
    ReqWithRequester,
    ZodValidationPipe,
} from '@server/shared';
import { CourseRunCreateDTO, courseRunCreateDTOSchema, CourseRunUpdateDTO, courseRunUpdateDTOSchema, CourseRunSearchRequestDTO, courseRunSearchRequestDTOSchema } from '@workspace/schemas';

@Controller('api/course-runs')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CourseRunController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    @Permissions('course.update')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body(new ZodValidationPipe(courseRunCreateDTOSchema)) dto: CourseRunCreateDTO,
        @Req() req: ReqWithRequester,
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courserun.create' },
                { ...dto, requester: req.requester },
            ),
        );
        return successResponse({ run: result }, 'Course run created successfully');
    }

    @Put(':id')
    @Permissions('course.update')
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new ZodValidationPipe(courseRunUpdateDTOSchema)) dto: CourseRunUpdateDTO,
        @Req() req: ReqWithRequester,
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courserun.update' },
                { id, ...dto, requester: req.requester },
            ),
        );
        return successResponse({ run: result }, 'Course run updated successfully');
    }

    @Get()
    @Public()
    async findAll(@Query(new ZodValidationPipe(courseRunSearchRequestDTOSchema)) query: CourseRunSearchRequestDTO) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.courserun.findAll' }, query),
        );
        return successPaginatedResponse(result);
    }

    @Get(':id')
    @Public()
    async findById(@Param('id', new ParseUUIDPipe()) id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.courserun.findById' }, { id }),
        );
        return successResponse({ run: result });
    }

    @Get('slug/:slug')
    @Public()
    async findBySlug(@Param('slug') slug: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.courserun.findBySlug' }, { slug }),
        );
        return successResponse({ run: result });
    }

    @Patch(':id/status')
    @Permissions('course.update')
    async updateStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('status') status: any,
        @Req() req: ReqWithRequester,
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courserun.updateStatus' },
                { id, status, requester: req.requester },
            ),
        );
        return successResponse({ run: result }, 'Course run status updated successfully');
    }

    @Get(':id/students')
    @Permissions('course.update')
    async getStudents(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courserun.getStudents' },
                { id, page, limit },
            ),
        );
        return successPaginatedResponse(result);
    }

    @Delete(':id')
    @Permissions('course.delete')
    async delete(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
        await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.courserun.delete' },
                { id, requester: req.requester },
            ),
        );
        return successResponse(null, 'Course run deleted successfully');
    }
}
