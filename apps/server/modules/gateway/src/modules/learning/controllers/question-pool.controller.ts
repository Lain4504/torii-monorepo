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
    successPaginatedResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('api/question-pools')
@UseGuards(IdentityAuthGuard)
export class QuestionPoolController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pools');
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.findOne' },
                    { id }
                )
            );
            return successResponse({ pool: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pool');
        }
    }

    @Get('course/:courseId')
    async getByCourse(@Param('courseId') courseId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.getByCourse' },
                    { courseId }
                )
            );
            return successResponse({ pools: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pools by course');
        }
    }

    @Get('lesson/:lessonId')
    async getByLesson(@Param('lessonId') lessonId: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.getByLesson' },
                    { lessonId }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pools by lesson');
        }
    }

    @Get('jlpt-level/:jlptLevel')
    async getByJlptLevel(@Param('jlptLevel') jlptLevel: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.getByJlptLevel' },
                    { jlptLevel }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch question pools by JLPT level');
        }
    }

    @Post()
    async create(@Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.create' },
                    { ...dto, userId: user.sub, userRole: user.role }
                )
            );
            return successResponse({ pool: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create question pool');
        }
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.update' },
                    { id, ...dto, userId: user.sub, userRole: user.role }
                )
            );
            return successResponse({ pool: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update question pool');
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.question-pool.delete' },
                    { id, userId: user.sub, userRole: user.role }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete question pool');
        }
    }
}
