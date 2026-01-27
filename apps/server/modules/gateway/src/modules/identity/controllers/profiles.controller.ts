import {
    Controller,
    Get,
    Param,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import {
    Public,
    successResponse,
    errorResponse
} from '@server/shared';

@Controller('api/profiles')
export class ProfilesController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get(':id')
    @Public()
    async findOne(@Param('id') id: string) {
        try {
            const response = await firstValueFrom(
                this.natsClient.send({ cmd: 'identity.users.findOne' }, { id }),
            );
            const user = response?.user;

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Sanitize user object for public view
            const publicProfile = {
                id: user.id,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                // App/User metadata might contain bio, title etc.
                userMetadata: user.userMetadata,
                createdAt: user.createdAt,
            };

            // Fetch learner stats from Learning service
            let stats = {
                totalCourses: 0,
                completedCourses: 0,
                averageProgress: 0,
                totalLearningHours: 0
            };

            try {
                // Add timeout to prevent hanging request if learning service is busy
                const learnerStats = await firstValueFrom(
                    this.natsClient.send({ cmd: 'learning.learner.getStats' }, { userId: user.id })
                        .pipe(timeout(3000))
                );
                if (learnerStats) {
                    stats = learnerStats as any;
                }
            } catch (error) {
                // Fail silently if learning service is down or no data, just return 0 stats
                // Logs for internal debugging but don't crash the request
                console.warn(`Failed to fetch learner stats for ${user.id}. Error: ${error instanceof Error ? error.message : String(error)}`);
            }

            return successResponse({
                user: {
                    ...publicProfile,
                    stats
                }
            });
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Profile not found');
        }
    }
}
