import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@server/shared';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { R2Provider } from './r2/r2.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../.env',
    }),
    SharedModule,
  ],
  controllers: [StorageController],
  providers: [StorageService, R2Provider],

})
export class StorageServiceModule { }


