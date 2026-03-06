import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateListener } from './certificate.listener';

@Module({
    providers: [CertificateService],
    controllers: [CertificateListener],
    exports: [CertificateService],
})
export class CertificateModule { }
