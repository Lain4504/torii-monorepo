import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { StorageService } from '@server/storage/modules/storage/storage.service';
import { StorageRepository } from '@server/storage/modules/storage/storage.repository';
import { StorageHandler } from '@server/storage/modules/storage/storage.handler';
import { SharedStorageModule } from '@server/shared/storage/shared-storage.module';
import { SharedModule, GlobalRpcExceptionFilter } from '@server/shared';
import { STORAGE_REPOSITORY_TOKEN } from '@server/storage/interfaces/repositories/i-storage.repository';
import { STORAGE_SERVICE_TOKEN } from '@server/storage/interfaces/services/i-storage.service';

@Module({
  imports: [SharedStorageModule, SharedModule],
  controllers: [StorageHandler],
  providers: [
    {
      provide: STORAGE_REPOSITORY_TOKEN,
      useClass: StorageRepository,
    },
    {
      provide: STORAGE_SERVICE_TOKEN,
      useClass: StorageService,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
  exports: [STORAGE_SERVICE_TOKEN, STORAGE_REPOSITORY_TOKEN],
})
export class StorageModule {}
