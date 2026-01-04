import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule, PrismaModule } from '@server/shared';
import { StorageFeatureModule as InternalStorageModule } from './modules/storage/storage.module';
import { StorageController } from './interfaces/http/storage.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../.env',
    }),
    SharedModule,
    PrismaModule,
    InternalStorageModule,
  ],
  controllers: [StorageController],
  providers: [StorageService, R2Provider],

})
export class StorageModule { }
