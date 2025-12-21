import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule, SupabaseModule } from '@server/shared';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../.env',
    }),
    SharedModule,
    SupabaseModule,
  ],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageServiceModule {}


