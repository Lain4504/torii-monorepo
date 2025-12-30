import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { ModuleController } from './module.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [ModuleController],
})
export class ModuleModule {}
