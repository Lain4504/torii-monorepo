import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { SharedStorageModule } from '@server/shared/storage/shared-storage.module';

@Module({
    imports: [SharedStorageModule],
    controllers: [StorageController],
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule { }
