import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageRepository } from './storage.repository';
import { SharedStorageModule } from '@server/shared/storage/shared-storage.module';
import { SharedModule } from '@server/shared';
import { STORAGE_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-storage.repository';
import { STORAGE_SERVICE_TOKEN } from '../../interfaces/services/i-storage.service';

@Module({
    imports: [SharedStorageModule, SharedModule],
    controllers: [],
    providers: [
        {
            provide: STORAGE_REPOSITORY_TOKEN,
            useClass: StorageRepository,
        },
        {
            provide: STORAGE_SERVICE_TOKEN,
            useClass: StorageService,
        },
    ],
    exports: [STORAGE_SERVICE_TOKEN, STORAGE_REPOSITORY_TOKEN],
})
export class StorageModule { }
