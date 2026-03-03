import { Module } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardsRepository } from './leaderboards.repository';
import { LeaderboardsHandler } from './leaderboards.handler';
import { LEADERBOARDS_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import { LEADERBOARDS_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import { PrismaModule } from '@server/shared';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
    imports: [PrismaModule, ProfilesModule],
    controllers: [LeaderboardsHandler],
    providers: [
        {
            provide: LEADERBOARDS_SERVICE_TOKEN,
            useClass: LeaderboardsService,
        },
        {
            provide: LEADERBOARDS_REPOSITORY_TOKEN,
            useClass: LeaderboardsRepository,
        },
    ],
    exports: [LEADERBOARDS_SERVICE_TOKEN],
})
export class LeaderboardsModule { }
