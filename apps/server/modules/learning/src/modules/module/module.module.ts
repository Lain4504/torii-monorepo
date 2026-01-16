import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { ModuleService } from './module.service';
import { ModuleRepository } from './module.repository';
import { MODULE_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { MODULE_SERVICE_TOKEN } from '../../interfaces/services';
import { CourseModule } from '../course/course.module';

/**
 * Module Feature Module
 * Handles course module management operations
 */
@Module({
  imports: [
    NatsClientModule,
    forwardRef(() => CourseModule),
  ],
  providers: [
    {
      provide: MODULE_REPOSITORY_TOKEN,
      useClass: ModuleRepository,
    },
    {
      provide: MODULE_SERVICE_TOKEN,
      useClass: ModuleService,
    },
  ],
  exports: [MODULE_SERVICE_TOKEN, MODULE_REPOSITORY_TOKEN],
})
export class ModuleModule { }
