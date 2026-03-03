import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesRepository } from './profiles.repository';
import { ProfilesHandler } from './profiles.handler';
import { PROFILES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import { PROFILES_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import { PrismaModule, NatsClientModule } from '@server/shared';

@Module({
    imports: [PrismaModule, NatsClientModule],
    controllers: [ProfilesHandler],
    providers: [
        {
            provide: PROFILES_SERVICE_TOKEN,
            useClass: ProfilesService,
        },
        {
            provide: PROFILES_REPOSITORY_TOKEN,
            useClass: ProfilesRepository,
        },
    ],
    exports: [PROFILES_SERVICE_TOKEN],
})
export class ProfilesModule { }
