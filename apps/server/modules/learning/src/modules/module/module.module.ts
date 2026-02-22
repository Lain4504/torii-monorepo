import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { ModuleService } from '@server/learning/modules/module/module.service';
import { ModuleRepository } from '@server/learning/modules/module/module.repository';
import { MODULE_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { MODULE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { CourseModule } from '@server/learning/modules/course/course.module';
import { ModuleProfile } from '@server/learning/infrastructure/mappings/module.profile';

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
    ModuleProfile,
  ],
  exports: [MODULE_SERVICE_TOKEN, MODULE_REPOSITORY_TOKEN],
})
export class ModuleModule { }

