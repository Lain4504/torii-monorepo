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
    UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    Permissions,
    PermissionsGuard,
    Public,
    ZodValidationPipe,
    successResponse,
} from '@server/shared';
import {
    AcademyQuestionPoolCreateDTO,
    AcademyQuestionPoolQueryDTO,
    AcademyQuestionPoolUpdateDTO,
    AddPoolQuestionsDTO,
    SampleQuestionsDTO,
    academyQuestionPoolCreateDTOSchema,
    academyQuestionPoolQueryDTOSchema,
    academyQuestionPoolUpdateDTOSchema,
    addPoolQuestionsDTOSchema,
    sampleQuestionsDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/question-pools')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class QuestionPoolController {
    constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

    @Get('test-me')
    @Public()
    async testMe() {
        return successResponse({ message: 'Question Pool Controller is reachable' });
    }

    @Get()
    @Permissions('exam.manage')
    async findAll(
        @Query(new ZodValidationPipe(academyQuestionPoolQueryDTOSchema))
        query: AcademyQuestionPoolQueryDTO,
    ) {
        const items = await firstValueFrom(
            this.nats.send({ cmd: 'academy.questionPool.findAll' }, query),
        );
        return successResponse({ items });
    }

    @Get(':id')
    @Permissions('exam.manage')
    async findById(@Param('id', new ParseUUIDPipe()) id: string) {
        const item = await firstValueFrom(
            this.nats.send({ cmd: 'academy.questionPool.findById' }, { id }),
        );
        return successResponse({ item });
    }

    @Post()
    @Permissions('exam.manage')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body(new ZodValidationPipe(academyQuestionPoolCreateDTOSchema))
        dto: AcademyQuestionPoolCreateDTO,
    ) {
        const item = await firstValueFrom(
            this.nats.send({ cmd: 'academy.questionPool.create' }, dto),
        );
        return successResponse({ item });
    }

    @Patch(':id')
    @Permissions('exam.manage')
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new ZodValidationPipe(academyQuestionPoolUpdateDTOSchema))
        dto: AcademyQuestionPoolUpdateDTO,
    ) {
        const item = await firstValueFrom(
            this.nats.send({ cmd: 'academy.questionPool.update' }, { id, input: dto }),
        );
        return successResponse({ item });
    }

    @Delete(':id')
    @Permissions('exam.manage')
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.questionPool.delete' }, { id }),
        );
        return successResponse(result);
    }

    @Get(':id/questions')
    @Permissions('exam.manage')
    async getQuestions(@Param('id', new ParseUUIDPipe()) id: string) {
        const items = await firstValueFrom(
            this.nats.send({ cmd: 'academy.questionPool.getQuestions' }, { id }),
        );
        return successResponse({ items });
    }

    @Post(':id/questions')
    @Permissions('exam.manage')
    async addQuestions(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new ZodValidationPipe(addPoolQuestionsDTOSchema))
        dto: AddPoolQuestionsDTO,
    ) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.questionPool.addQuestions' }, { id, input: dto }),
        );
        return successResponse(result);
    }

    @Delete(':id/questions/:questionId')
    @Permissions('exam.manage')
    async removeQuestion(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Param('questionId', new ParseUUIDPipe()) questionId: string,
    ) {
        const result = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.questionPool.removeQuestion' },
                { id, questionId },
            ),
        );
        return successResponse(result);
    }

    @Post(':id/sample')
    @Permissions('exam.manage')
    async sample(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new ZodValidationPipe(sampleQuestionsDTOSchema))
        dto: SampleQuestionsDTO,
    ) {
        const items = await firstValueFrom(
            this.nats.send({ cmd: 'academy.questionPool.sample' }, { id, input: dto }),
        );
        return successResponse({ items });
    }
}
