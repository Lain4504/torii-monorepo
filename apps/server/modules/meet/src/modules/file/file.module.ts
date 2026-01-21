import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileNatsController } from './file.nats.controller';
import { SharedModule } from '@server/shared';
// Need to import these to provide them to FileService if they are not global
// But in this monorepo, they seem to be part of the RoomModule or exported from somewhere

@Module({
    imports: [SharedModule],
    providers: [FileService],
    controllers: [FileNatsController],
    exports: [FileService],
})
export class FileModule { }
