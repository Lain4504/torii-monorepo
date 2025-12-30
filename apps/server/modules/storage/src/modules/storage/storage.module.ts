import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { R2Provider } from './r2/r2.provider';

@Module({
    providers: [StorageService, ConfigService, R2Provider],
    exports: [StorageService],
})
export class StorageFeatureModule { }
