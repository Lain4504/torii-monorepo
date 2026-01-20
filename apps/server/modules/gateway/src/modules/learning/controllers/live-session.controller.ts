import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Inject,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    RolesGuard,
    Roles,
    successResponse,
} from '@server/shared';
import {
    UserRole,
    LiveSessionCreateDTO,
    LiveSessionUpdateDTO,
} from '@workspace/schemas';

interface RequestWithUser extends Request {
    user: {
        sub: string;
        role: string;
        email: string;
    };
}

@Controller('live-sessions')
@UseGuards(GatewayAuthGuard, RolesGuard)
export class LiveSessionController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy
    ) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS)
    async create(@Body() dto: LiveSessionCreateDTO, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.create' },
                { ...dto, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse(result, 'Live session scheduled successfully');
    }

    @Get('course/:courseId')
    async findByCourse(@Param('courseId') courseId: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.liveSession.findByCourseId' }, { courseId })
        );
        return successResponse(result);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.liveSession.findOne' }, { id })
        );
        return successResponse(result);
    }

    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS)
    async update(
        @Param('id') id: string,
        @Body() dto: LiveSessionUpdateDTO,
        @Req() req: RequestWithUser
    ) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.update' },
                { id, ...dto, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse(result, 'Live session updated successfully');
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS)
    async delete(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.delete' },
                { id, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse(result, 'Live session deleted successfully');
    }

    @Post(':id/start')
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS, UserRole.LECTURER)
    async start(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.start' },
                { id, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse(result, 'Live session started');
    }

    @Post(':id/end')
    @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STAFF_LMS, UserRole.LECTURER)
    async end(@Param('id') id: string, @Req() req: RequestWithUser) {
        const user = req.user;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.liveSession.end' },
                { id, userId: user.sub, userRole: user.role, userEmail: user.email }
            )
        );
        return successResponse(result, 'Live session ended');
    }
}
