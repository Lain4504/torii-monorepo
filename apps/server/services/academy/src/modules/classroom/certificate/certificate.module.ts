import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateListener } from './certificate.listener';
import { CertificateHandler } from './certificate.handler';

@Module({
  providers: [CertificateService],
  controllers: [CertificateListener, CertificateHandler],
  exports: [CertificateService],
})
export class CertificateModule {}
