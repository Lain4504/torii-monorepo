import { Module } from '@nestjs/common';
import { StudySetService } from './study-set.service';
import { StudySetHandler } from './study-set.handler';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
    imports: [InfrastructureModule],
    providers: [StudySetService],
    controllers: [StudySetHandler],
})
export class StudySetModule { }
