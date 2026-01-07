import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { ModuleService } from './module.service';

@Module({
  imports: [NatsClientModule],
  controllers: [],
  providers: [ModuleService],
  exports: [ModuleService],
})
export class ModuleModule { }
