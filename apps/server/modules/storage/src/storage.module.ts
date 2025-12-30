import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@server/shared';
import { StorageFeatureModule } from './modules/storage/storage.module';
import { StorageController } from './interfaces/nats/storage.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../.env',
    }),
    SharedModule,
    StorageFeatureModule,
  ],
  controllers: [StorageController],
  providers: [],
})
export class StorageModule { }


