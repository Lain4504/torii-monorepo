import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { NatsClientModule } from '@server/shared';

@Module({
  imports: [NatsClientModule],
  controllers: [StorageController],
})
export class StorageModule {}


