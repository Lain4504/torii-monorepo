import { Module } from '@nestjs/common';
import { StorageModule } from './storage.module';

@Module({
    imports: [
        StorageModule,
    ],
    controllers: [],
    providers: [],
})
export class StorageGatewayModule { }
