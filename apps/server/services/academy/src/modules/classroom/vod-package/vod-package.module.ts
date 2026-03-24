import { Module } from '@nestjs/common';
import { VodPackageService } from './vod-package.service';
import { VodPackageHandler } from './vod-package.handler';

@Module({
  providers: [VodPackageService],
  controllers: [VodPackageHandler],
  exports: [VodPackageService],
})
export class VodPackageModule {}
